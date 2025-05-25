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

### How to access Deno KV in Deploy Deploy

1. Go to The Deno Deploy Dashboard, click on your project and then on the KV tab
2. The KV Database page has a section called `Connect to this database from Deno CLI` which contains the address to access the datatabase. Copy it.
3. Set the `DENORO_DB_PATH` environment variable with the address you copied
4. You also need to configured the `DENO_KV_ACCESS_TOKEN` environment variables with a Deno Depoy access token. You can find more info on how to create one accessing [this](https://dash.deno.com/account#access-tokens) page.
