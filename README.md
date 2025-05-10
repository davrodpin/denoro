# Denoro

A command-line interface tool that allows you to explore, manage, and manipulate local [Deno KV](https://deno.com/kv) database files.

Deno KV is a built-in key-value database for Deno applications that provides a simple, fast, and reliable way to store and retrieve data. It uses SQLite under the hood and supports features like atomic transactions, versioning, and range queries.

## Installation

### Quick Install
```bash
curl -fsSL https://raw.githubusercontent.com/davrodpin/denoro/main/install.sh | sh
```

### Build from Source
```bash
# Clone the repository
git clone https://github.com/davrodpin/denoro.git
cd denoro

# Build the project
deno task build:dev
```

## Usage

![Denoro Demo](docs/imgs/denoro-deno.20250510.gif)
