---
title: MCP server
description: The design system MCP server in pd dev and pd mcp: where it answers, how a client connects, its seven read-only tools and what it refuses.
layout: doc
---

An agent that changes your design system needs to know what the change touches. Pattern Dump's MCP server tells it, from inside `pd dev`: which components exist, what one accepts, where it is used, which stylesheets style it, and everything a change reaches. MCP is the Model Context Protocol, the way a client such as Claude Code asks a tool for answers.

The server answers from the project graph, the same one the workbench and the command line read, and it follows every save. It only reads: no tool changes a file or runs a check. It speaks MCP revision 2025-11-25.

A client reaches it in one of two ways: over HTTP from a `pd dev` that is already running, or over stdio, with `pd mcp` started by the client itself.

## Over HTTP, from pd dev

`pd dev` starts the server with the workbench and prints where it answers:

```text
[dev-server] MCP: http://mcp.localhost:4000/
(or http://localhost:4000/mcp)
```

`http://mcp.localhost:<port>/`
: The server's own host name, at `pd dev`'s port. It answers at `/` and at `/mcp`. `mcp.host` in the config changes the name ([Configuration](/reference/configuration/#mcp-server)).

`http://localhost:<port>/mcp`, `http://127.0.0.1:<port>/mcp`
: For a client that doesn't resolve `*.localhost` names.

On `pd.localhost` and on the site's host, `/mcp` is an address of the workbench or the site, not the server's. On the server's own host, any path but `/` and `/mcp` gets `404` and `Not Found: this host is the MCP server's, at / (POST)`.

A client that connects over HTTP names the address in its config. For Claude Code, in a `.mcp.json` in the project folder:

```json
{
  "mcpServers": {
    "pattern-dump": {
      "type": "http",
      "url": "http://mcp.localhost:4000/"
    }
  }
}
```

The port is `pd dev`'s, `4000` unless `--port` or `PD_PORT` sets another. The client finds the server only while `pd dev` runs.

## Over stdio, with pd mcp

`pd mcp` serves the same tools to a client that starts a process: a `.mcp.json` with a command, or the Claude desktop app. It runs your project's `pd dev` in the same process, on free ports on `127.0.0.1` with its watcher, so its answers are `pd dev`'s and follow every save. It ends when the client closes its input.

```json
{
  "mcpServers": {
    "pattern-dump": {
      "command": "npx",
      "args": ["pd", "mcp"]
    }
  }
}
```

`pd mcp` takes `--root` and `--config`, as `pd dev` does, and nothing else ([Command line](/reference/cli/#pd-mcp)). Its standard output carries the protocol only. `pd dev`'s own lines, warnings and errors go to standard error, where a client logs them.

## The protocol

The server takes one JSON-RPC message per `POST` and keeps no session. A request is answered with its result. A notification gets `202` and no body.

`initialize` answers with the revision, `2025-11-25`. A client that names another in its `MCP-Protocol-Version` header gets `400`. A tool's answer comes twice in the result: as `structuredContent`, and as the same JSON in a text block, for clients that read only text.

A request the server doesn't take gets one of these:

A `GET`, or any method but `POST`
: `405`, `Method Not Allowed: the MCP server takes one JSON-RPC message per POST`.

Another protocol revision
: `400`, `Bad Request: this server speaks MCP 2025-11-25, not <version>`, where `<version>` is the one the client named.

An id the project doesn't have
: The tool's own error answer (`isError`), not a protocol error: `there is no component "<id>" in this project`. When ids are close by spelling, it goes on with `: did you mean` and them, such as `"atoms/button", "atoms/button~icon"`.

A tool that doesn't exist
: A JSON-RPC "invalid params" error (`-32602`): `there is no tool "<name>": the tools are components, contract, usage, blast_radius, ownership, affected, checks`.

An argument the tool doesn't take
: The same error, with `unknown argument: <name>`.

A missing or empty id
: The same error, with `"id" must be a non-empty string`.

## What it refuses

`pd dev` listens on `127.0.0.1` only, so only your own machine reaches the server. It then checks each request's `Host` header first and its `Origin` second, as the MCP specification asks of a server on HTTP.

A host name that isn't `pd dev`'s own
: `403`, `Forbidden: this server answers only to its own host names`.

A page of another site
: `403`, `Forbidden: the MCP server answers no page of another site (Origin)`. A request with no `Origin`, as a client sends it, is answered, and so is one from a page `pd dev` served.

## The tools

The server has seven tools, each marked read-only. Every answer is JSON with `"version": 1`, the same JSON the command line prints with `--json`. `pd describe` gives four of the answers for one component together, and `pd affected` gives `affected`'s.

`components`
: Every component: its id, its role (a component, layout, partial or view), where it comes from (the project or a pattern package), its variants, and whether the workbench hides it.
: Optional arguments: `role`, one of the four roles in lower case, such as `"layout"`, and `origin`, `"project"` or a package's npm name.

`contract`
: What a component accepts: its JSON Schema as written, its variants and its documentation. Argument: `id`, a component's or a variant's (`atoms/button~icon`).

`usage`
: Where a component appears: the components that include it, and every page that places it or renders with it, directly or through a component that includes it. Argument: `id`.

`blast_radius`
: What breaks if a component changes: the components, stylesheets and pages it reaches, each with the path of edges that connects it. Argument: `id`.

`ownership`
: Which stylesheets style a component. The answer lists its own stylesheets, the classes they define and the modules they load. It also lists the classes of other components its stylesheets style, the stylesheets of others that style its classes, and the classes its template borrows. Argument: `id`.

`affected`
: Everything a change reaches, as one flat list of components and pages to check before handing over. Arguments: `ids`, changed component ids, and `files`, changed files relative to the project's root; either or both.

`checks`
: The latest audit results: for one component its findings, or the project's summary without one. Optional argument: `id`.
: It reads the running `pd dev`'s audit, else the last one saved, and never runs one. With none, its answer is `No audit results yet: run pd audit, or open the workbench's Audit tab, then ask again.`

`usage` for this site's `atoms/button`, which only the search field includes:

```json
{
  "version": 1,
  "id": "atoms/button",
  "components": [
    "molecules/search-field"
  ],
  "pages": []
}
```

[Relationships](/concepts/relationships/) explains the graph the tools read, and [Claude Code on this site](/in-practice/claude-code/) shows a client asking this site's project three questions.
