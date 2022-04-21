# Environment Version Manager

A tool for developers using Windows that allows you to quickly switch between PHP versions.

- [About](#about)
- [Prerequisites](#prerequisites)
- [Installation & Update](#installation--Update)
- [Usage](#Usage)
- [FAQs](#faqs)
- [Support](#support)

If this package has helped you, and you're feeling particularly generous, you can tip me some ETH (or ETH based crypto): 0x6515654c8e931052ab17a63311411D475D503e59

# About

### What does this tool do?

- Downloads & installs PHP releases for Windows
  - Automatically sets certs for cURL
  - Allows you to quickly select extensions you wish to enable
- Seamlessly switch between PHP versions all from the command line

# Prerequisites

This tool assumes a couple of things:

1. You have [Node.js](https://nodejs.org/en/download/) installed
2. You have access to a terminal with administrative privileges. This is required because `evm` modifies the `PATH` variable

# Installation & Update

This package is installed as a global `npm` package:

```
npm i -g @getevm/evm@latest
```

# Usage

The basic syntax for the command is:

```bash
$ evm <cmd> <version> [-ts] [-at <x86|x64>]
```

- The `-ts` flag refers to thead safety. If omitted it will pull a non-thread safe release
- The `-at` flag refers to the architecture type. It allows you to specify whether to pull a release targeting a specific architecture type. If
  omitted it will try and sniff the architecture of the machine requesting the release and use that

The available commands are:

```bash
$ evm install 8.1.0 # install v8.1.0 non-thread safe and sniff the arch type from OS

$ evm install 8.1.0 --ts --archType=x86 # install v8.1.0 thread safe 32bit

$ evm use 8.1.0 --ts --archType=x64 # use v8.1.0 thread safe 64bit

$ evm ls # see information about current evm installed releases

$ evm sync # synchronise the local version file with the remote version file; used to pull latest PHP releases
```

# FAQs

### Why do I need Node.js to download PHP?

Originally, `evm` was written in PHP and available via Composer, however, I noticed several issues:

1. This method required the user to already have PHP and Composer installed and while it's probably fair to assume that most PHP devs do, this process seemed counterintuitive to me. 
2. When switching from lower versions of PHP to higher versions, Composer (and its dependencies) would throw errors as they expect a specific version. So it made sense to me to switch to a complete different language (Node) so that `evm` is no longer dependent on specific PHP versions or Composer packages.
3. It's much easier to install Node.js than it is PHP. Node provides an executable file therefore you can run that, install `evm`, and then start installing PHP.

---

### My `PATH` variable has been ruined after using `evm`!

Though rare - we've put in safety measures to prevent this - it's possible your `PATH` variable might get damaged during this process. 

For this reason, we generate a log file each time we attempt to make changes to the `PATH` variable. This log file contains the value of the `PATH` variable before we modified. If `evm` can't create this file for some reason, it won't proceed.

The `logs` directory can be found in the `evm` directory. 

---

### Why is it called "Environment Version Manager" when it only manages PHP?

The alternative was to call it `pvm` (PHP Version Manager) and I preferred `evm`.

Secondly, my intention was to (is to?) make it work with other languages to (Python?) but this isn't confirmed yet.

---

Any other questions? [Open an issue](https://github.com/getevm/evm/issues/new).

# Support

- If you find any bugs, [open an issue](https://github.com/getevm/evm/issues/new)
- If you want to help in the development, fork and make PRs
- If this package has helped you, and you're feeling particularly generous, you can tip me some ETH (or ETH based crypto): 0x6515654c8e931052ab17a63311411D475D503e59
