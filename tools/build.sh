#!/bin/bash

# Set up cleanup trap
cleanup() {
    rm -f "$PROJECT_ROOT/src/VERSION"
}
trap cleanup EXIT INT TERM

# Usage documentation
usage() {
    cat << EOF
Build denoro binary.

Usage:
    build.sh [--arch=<arch>] [--version=<version>]
    build.sh -h | --help

Options:
    -h --help           Show this help message
    --arch=<arch>       Target architecture (e.g. x86_64-unknown-linux-gnu)
    --version=<version> Force specific version instead of reading from deno.json
EOF
    exit 1
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        -h|--help)
            usage
            ;;
        --arch=*)
            TARGET_ARCH="${1#*=}"
            shift
            ;;
        --version=*)
            FORCE_VERSION="${1#*=}"
            shift
            ;;
        *)
            echo "Unknown option: $1"
            usage
            ;;
    esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Get version either from argument or deno.json
if [ -n "$FORCE_VERSION" ]; then
    VERSION="$FORCE_VERSION"
else
    VERSION=$(deno eval "const json = JSON.parse(await Deno.readTextFile('$PROJECT_ROOT/deno.json')); console.log(json.version)")
fi

# Create bin directory if it doesn't exist
mkdir -p "$PROJECT_ROOT/bin"

# Create VERSION file
echo "$VERSION" > "$PROJECT_ROOT/src/VERSION"

# Build the binary
echo "Building denoro v$VERSION${TARGET_ARCH:+ for $TARGET_ARCH}..."
OUTPUT_FILE="$PROJECT_ROOT/bin/denoro-$VERSION"
[ -n "$TARGET_ARCH" ] && OUTPUT_FILE="$OUTPUT_FILE-$TARGET_ARCH"

deno compile \
    --allow-all \
    --include "$PROJECT_ROOT/src/VERSION" \
    ${TARGET_ARCH:+--target "$TARGET_ARCH"} \
    --output "$OUTPUT_FILE" \
    "$PROJECT_ROOT/src/app.ts"
