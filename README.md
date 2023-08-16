# Opt

Compress and convert images to webp.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

- Rust
  - [Tauri](https://tauri.app/)
  - [SQLx](https://github.com/launchbadge/sqlx)
- TypeScript
  - React

```base
# Development
npm run tauri dev

# Testing
npm test
cd src-tauri && cargo test
```

## Note

[Oxipng](https://github.com/shssoichiro/oxipng)の8.0.0において、rayonの並列処理中でデッドロックが発生するため、これを回避するために一時的にCargo.tomlでGitHubのmasterブランチを指定している点に注意
