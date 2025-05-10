#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# GitHub repository details
REPO="davrodpin/denoro"
LATEST_RELEASE_URL="https://api.github.com/repos/${REPO}/releases/latest"

# Function to print error messages and exit
error() {
    echo -e "${RED}Error: $1${NC}" >&2
    exit 1
}

# Function to print success messages
success() {
    echo -e "${GREEN}$1${NC}"
}

# Function to print info messages
info() {
    echo -e "${YELLOW}$1${NC}"
}

# Function to clean up temporary files
cleanup() {
    if [ -n "${temp_dir}" ] && [ -d "${temp_dir}" ]; then
        rm -rf "${temp_dir}"
    fi
}

# Set up trap to clean up on exit
trap cleanup EXIT

# Function to detect current shell
detect_shell() {
    local shell_name=$(basename "$SHELL")
    info "Current shell detected: $shell_name"
    case "$shell_name" in
        bash)
            echo "$HOME/.bashrc"
            ;;
        zsh)
            echo "$HOME/.zshrc"
            ;;
        *)
            error "Unsupported shell: $shell_name"
            ;;
    esac
}

# Detect OS and architecture
detect_arch() {
    local arch
    case "$(uname -m)" in
        x86_64)
            case "$(uname -s)" in
                Linux*) arch="x86_64-unknown-linux-gnu" ;;
                Darwin*) arch="x86_64-apple-darwin" ;;
                *) error "Unsupported OS" ;;
            esac
            ;;
        arm64|aarch64)
            case "$(uname -s)" in
                Linux*) arch="aarch64-unknown-linux-gnu" ;;
                Darwin*) arch="aarch64-apple-darwin" ;;
                *) error "Unsupported OS" ;;
            esac
            ;;
        *) error "Unsupported architecture: $(uname -m)" ;;
    esac
    echo "$arch"
}

# Get the latest release version
get_latest_version() {
    local version
    if command -v curl >/dev/null 2>&1; then
        version=$(curl -s "${LATEST_RELEASE_URL}" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
    elif command -v wget >/dev/null 2>&1; then
        version=$(wget -qO- "${LATEST_RELEASE_URL}" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
    else
        error "Neither curl nor wget is installed. Please install one of them."
    fi
    
    if [ -z "$version" ]; then
        error "Failed to get latest version"
    fi
    
    echo "$version"
}

# Main installation process
main() {
    # Create temporary directory
    temp_dir=$(mktemp -d)
    info "Created temporary directory: ${temp_dir}"
    
    info "Detecting system architecture..."
    local arch=$(detect_arch)
    info "Architecture detected: $arch"
    
    info "Fetching latest release version..."
    local version=$(get_latest_version)
    info "Latest version: $version"
    
    # Create binary name - remove the 'v' prefix from version
    local version_number=${version#v}
    local binary_name="denoro-${version_number}-${arch}"
    local download_url="https://github.com/${REPO}/releases/download/${version}/${binary_name}"
    
    # Determine installation directory
    local install_dir="/usr/local/bin"
    if [ ! -w "$install_dir" ]; then
        install_dir="$HOME/.local/bin"
        mkdir -p "$install_dir"
    fi
    
    info "Downloading ${binary_name}..."
    if command -v curl >/dev/null 2>&1; then
        info "Download URL: $download_url"
        curl -L -o "${temp_dir}/${binary_name}" "$download_url"
    else
        info "Download URL: $download_url"
        wget -O "${temp_dir}/${binary_name}" "$download_url"
    fi
    
    if [ ! -f "${temp_dir}/${binary_name}" ]; then
        error "Failed to download binary"
    fi
    
    info "Installing to ${install_dir}..."
    chmod +x "${temp_dir}/${binary_name}"
    mv "${temp_dir}/${binary_name}" "${install_dir}/denoro"
    
    success "Installation completed successfully!"
    info "You can now use 'denoro' from your terminal"
    
    # Add to PATH if needed
    case ":$PATH:" in
        *":$install_dir:"*) 
            ;;
        *)
            info "Adding ${install_dir} to your PATH..."
            local path_export="export PATH=\"$install_dir:\$PATH\""
            local rc_file=$(detect_shell)
            info "Using configuration file: $rc_file"
            
            if [ -f "$rc_file" ]; then
                if ! grep -q "^${path_export}$" "$rc_file"; then
                    echo "$path_export" >> "$rc_file"
                    info "Added PATH configuration to $rc_file"
                    info "Please run 'source $rc_file' or restart your terminal"
                fi
            else
                info "Could not find shell configuration file: $rc_file"
            fi
            ;;
    esac
}

# Run the installation
main 