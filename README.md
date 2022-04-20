# Environment Version Manager

A tool for developers using Windows which allows you to quickly switch between PHP versions.

### What does this tool do?

- Downloads & installs PHP releases for Windows
    - Allows you to quickly select extensions you wish to enable
    - Automatically sets certs for cURL
- Seamlessly switch between PHP versions all from the command line

# Prerequisites

This tool assumes a couple of things:

1. You have [Node.js](https://nodejs.org/en/download/) installed
2. You have access to a terminal with administrative privileges. This is required because evm modifies the PATH variable

# Installation & Update

This package is installed as a global package:

```
npm i -g @getevm/evm@latest
```

and from time to time we'll update this package:

```
npm update -g @getevm/evm@latest
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

$ evm sync # synchronise version file with the centralized file; used to pull latest PHP releases
```

# FAQs

### Why do I need Node.js to download PHP?

Originally, `evm` was written in PHP and available via Composer, however, I experienced several issues:

1. This method required the user to already have PHP and Composer installed and while it's probably fair to assume that most PHP devs do, this process seemed counterintuitive to me. 
2. When switching from lower versions of PHP to higher versions Composer (and its dependencies) would complain as they expect specific versions. So it made sense to me to switch to a complete different language (Node) so that `evm` is no longer dependent on specific PHP versions or Composer packages.

### Why is it called "Environment Version Manager" when it only manages PHP?



# Support
