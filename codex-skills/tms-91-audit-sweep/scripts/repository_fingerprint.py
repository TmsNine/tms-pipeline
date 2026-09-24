#!/usr/bin/env python3
"""Print a bounded, content-sensitive fingerprint for one Git worktree."""

# Adapted from di-sukharev/code-scout-skill:
# https://github.com/di-sukharev/code-scout-skill
#
# MIT License
#
# Copyright (c) 2026 Dima Sukharev
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import re
import stat
import subprocess
import sys


MAX_BYTES = 256 * 1024 * 1024
TIMEOUT_SECONDS = 60
HEAD_PATTERN = re.compile(r"(?:[0-9a-f]{40}|[0-9a-f]{64})\Z")


def git(root: Path, *args: str) -> bytes:
    result = subprocess.run(
        ["git", "-C", os.fspath(root), *args],
        check=False,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        timeout=TIMEOUT_SECONDS,
    )
    if result.returncode != 0:
        message = result.stderr.decode("utf-8", errors="replace").strip()
        raise RuntimeError(message or f"git {' '.join(args)} failed")
    if len(result.stdout) > MAX_BYTES:
        raise RuntimeError(f"git {' '.join(args)} output exceeds safety limit")
    return result.stdout


def update(digest: "hashlib._Hash", label: bytes, payload: bytes) -> None:
    digest.update(len(label).to_bytes(8, "big"))
    digest.update(label)
    digest.update(len(payload).to_bytes(8, "big"))
    digest.update(payload)


def fingerprint(root_arg: str) -> dict[str, str]:
    requested = Path(root_arg).expanduser().resolve(strict=True)
    repository = Path(
        git(requested, "rev-parse", "--show-toplevel").decode("utf-8").strip()
    ).resolve(strict=True)
    if requested != repository:
        raise RuntimeError(f"expected repository root {repository}, got {requested}")

    head = git(repository, "rev-parse", "--verify", "HEAD").decode("ascii").strip()
    if HEAD_PATTERN.fullmatch(head) is None:
        raise RuntimeError("repository HEAD is not a supported Git object ID")

    status_before = git(
        repository, "status", "--porcelain=v1", "-z", "--untracked-files=all"
    )
    untracked_before = git(
        repository, "ls-files", "--others", "--exclude-standard", "-z"
    )
    tracked_diff = git(
        repository,
        "diff",
        "--no-ext-diff",
        "--no-textconv",
        "--binary",
        "--submodule=diff",
        "HEAD",
        "--",
    )

    digest = hashlib.sha256()
    consumed = len(status_before) + len(tracked_diff)
    if consumed > MAX_BYTES:
        raise RuntimeError("fingerprint input exceeds safety limit")
    update(digest, b"status", status_before)
    update(digest, b"tracked-diff", tracked_diff)

    for encoded_path in sorted(path for path in untracked_before.split(b"\0") if path):
        relative = os.fsdecode(encoded_path)
        absolute = repository / relative
        before = absolute.lstat()
        update(digest, b"untracked-path", encoded_path)
        update(digest, b"untracked-mode", before.st_mode.to_bytes(8, "big"))

        if stat.S_ISLNK(before.st_mode):
            payload = os.fsencode(os.readlink(absolute))
            consumed += len(payload)
            if consumed > MAX_BYTES:
                raise RuntimeError("fingerprint input exceeds safety limit")
            update(digest, b"untracked-symlink", payload)
        elif stat.S_ISREG(before.st_mode):
            file_digest = hashlib.sha256()
            size = 0
            with absolute.open("rb") as handle:
                for chunk in iter(lambda: handle.read(1024 * 1024), b""):
                    consumed += len(chunk)
                    size += len(chunk)
                    if consumed > MAX_BYTES:
                        raise RuntimeError("fingerprint input exceeds safety limit")
                    file_digest.update(chunk)
            update(
                digest,
                b"untracked-file",
                size.to_bytes(8, "big") + file_digest.digest(),
            )
        else:
            update(digest, b"untracked-special", b"")

        after = absolute.lstat()
        stable = ("st_dev", "st_ino", "st_mode", "st_size", "st_mtime_ns")
        if any(getattr(before, field) != getattr(after, field) for field in stable):
            raise RuntimeError(f"worktree changed while reading {relative}")

    head_after = git(repository, "rev-parse", "--verify", "HEAD").decode("ascii").strip()
    status_after = git(
        repository, "status", "--porcelain=v1", "-z", "--untracked-files=all"
    )
    untracked_after = git(
        repository, "ls-files", "--others", "--exclude-standard", "-z"
    )
    if (
        head_after != head
        or status_after != status_before
        or untracked_after != untracked_before
    ):
        raise RuntimeError("worktree changed while fingerprinting")

    return {"head": head, "worktree_sha256": digest.hexdigest()}


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: repository_fingerprint.py <repository-root>", file=sys.stderr)
        return 2
    try:
        result = fingerprint(sys.argv[1])
    except (OSError, RuntimeError, subprocess.TimeoutExpired, UnicodeError) as error:
        print(f"repository fingerprint failed: {error}", file=sys.stderr)
        return 1
    print(json.dumps(result, sort_keys=True, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
