---
title: "90% You Need to Know about uv"
date: 2025-06-12 00:00:00+0000
description: "An elegant tool to manage Python projects."
tags: 
    - "uv"
categories: ["tools"]
image: "image.png"
---

If you're a conda user, you may be familiar with the following commands to manage your Python environments:

```bash
# Create a new conda environment with Python 3.x
conda create -n <myenv> python=3.x
# Activate the environment
conda activate <myenv>
# Install a package
conda install <package> # or pip install <package>
# Install from a requirements file
conda install --file requirements.txt # or pip install -r requirements.txt
# Remove a package
conda remove <package> # or pip uninstall <package>
# Deactivate the environment
conda deactivate
# Remove the environment
conda remove -n <myenv> --all
# and so on...
```

Recently, a new tool [uv](https://github.com/astral-sh/uv) has emerged that aims to simplify and enhance the management of Python projects. In many cases, it can be a drop-in replacement for conda, providing a more efficient way to handle Python environments and dependencies. There are several blogs and articles that discuss the advantages/disadvantages of using uv over conda, but this post will focus on how to switch from conda/pip to uv with minimal effort.

## Contents
- [Contents](#contents)
- [conda/pip style usage](#condapip-style-usage)
  - [Creating a New Virtual Environment](#creating-a-new-virtual-environment)
  - [Removing Virtual Environments](#removing-virtual-environments)
  - [Activating/Deactivating the Virtual Environment](#activatingdeactivating-the-virtual-environment)
  - [Installing/Removing Packages](#installingremoving-packages)
  - [Packaging and Distributing Your Project](#packaging-and-distributing-your-project)
- [uv style usage](#uv-style-usage)
  - [Creating a New Project](#creating-a-new-project)
  - [What is a Project?](#what-is-a-project)
  - [Adding Dependencies](#adding-dependencies)
  - [Changing/Removing Dependencies](#changingremoving-dependencies)
  - [Managing Python Versions](#managing-python-versions)
  - [Locking and Syncing](#locking-and-syncing)

## conda/pip style usage
If you just want a quick way to use uv like you would with conda or pip, then the following commands should help you get started:
### Creating a New Virtual Environment
```bash
uv venv <myenv> --python 3.x
```
After running the above command, you will have a `./<myenv>` directory containing the new virtual environment. A common convention is to use `.venv` as the environment name, which can be created with a simpler command: `uv venv`.

### Removing Virtual Environments
As you might have guessed, removing a virtual environment is as simple as:
```bash
rm -rf <myenv>
```

### Activating/Deactivating the Virtual Environment
To activate the virtual environment, you can use:
```bash
source <myenv>/bin/activate # or . <myenv>/bin/activate
```
To deactivate it, simply run:
```bash
deactivate
```

### Installing/Removing Packages
To install Python packages, you can use:
```bash
uv pip install <package>
# also supported:
# uv pip install -r requirements.txt
# uv pip install -e .
# ...
```

You can check the installed packages with:
```bash
uv pip list
```
Or inspect with:
```bash
uv pip show <package>
```

To remove package(s), use:
```bash
uv pip uninstall <package1> <package2> ...
```

> [!WARNING]
> If you are in a uv environment nested inside a conda environment, if you run `pip install <package>`, it will install the package in the conda environment rather than the uv environment. If you are in a clean uv environment, `pip` should be unavailable, and you should use `uv pip` instead.

### Packaging and Distributing Your Project
To list all the packages in the environment in a requirements.txt format:
```bash
uv pip freeze > requirements.txt
```
To build a package for distribution, you can use:
```bash
uv build
```
This will create a `dist` directory containing the built package.
To publish your package to PyPI, use:
```bash
uv publish
```

## uv style usage
If you want to take full advantage of uv's features, you can use it in a more idiomatic way. This workflow revolves around your project's `pyproject.toml` file, promoting reproducible environments and clear dependency management.

### Creating a New Project
To see the structure of a uv project, the simplest way is to create one:
```bash
uv init <myproject>
```
This will create a new directory called `<myproject>` with the following structure:
```
myproject
├── .gitignore
├── .python-version
├── pyproject.toml
├── README.md
└── src/
    └── myproject/
        └── __init__.py
```
This command sets up a standard, modern Python project structure for you.

### What is a Project?
A project is all the files (containing metadata) and directories that are needed to run your Python application. In modern Python, the central piece of metadata is the `pyproject.toml` file. It declares the project's name, version, dependencies, and required Python version, replacing older files like `setup.py` and `requirements.txt`.

### Adding Dependencies
Now you want to add some packages to your project, say `numpy` and `requests`. You can do this by running:
```bash
uv add numpy requests
```
After running this command, you will see that the `pyproject.toml` file has been updated with the new dependencies:
```toml
[project]
name = "myproject"
version = "0.1.0"
description = "Add your description here"
authors = [
    { name = "My Name", email = "my.email@example.com" },
]
readme = "README.md"
requires-python = ">=3.12"
dependencies = [
    "numpy>=2.0.0",
    "requests>=2.32.3",
]
```
At the same time, `uv` performs three key actions:
1.  It creates a virtual environment at `./.venv` if one doesn't exist.
2.  It installs `numpy` and `requests` into the virtual environment.
3.  It creates a `uv.lock` file, which records the exact versions of all installed packages (including dependencies of dependencies).

Note that if you use `uv pip install <package>`, it will install the package in the current virtual environment, but it will **not** update the `pyproject.toml` file or the `uv.lock` file. You should use `uv add` when you want to formally add a dependency to your project.

### Changing/Removing Dependencies
To remove a dependency you no longer need, use the `uv remove` command:
```bash
uv remove requests
```
This will remove `requests` from your `pyproject.toml`, update the `uv.lock` file, and uninstall the package from your virtual environment.

To change a dependency version, you can directly edit the `pyproject.toml` file. For example, to constrain `numpy` to an older version:
```toml
# In pyproject.toml
dependencies = [
    "numpy>=1.26.0,<2.0.0",
]
```
After saving the file, your environment is now out-of-sync. You can update it by running:
```bash
uv sync
```
This command will read the `pyproject.toml`, resolve the new dependencies, update `uv.lock`, and ensure your `.venv` perfectly matches the new requirements.

### Managing Python Versions
Unlike `conda`, `uv` does **not** manage Python installations itself. It uses Python interpreters that are already available on your system. You can install different Python versions using tools like [pyenv](https://github.com/pyenv/pyenv), [Rye](https://rye-up.com/), or the official installers from python.org.

You can see which Python interpreters `uv` can find with:
```bash
uv python find
```
When you initialize a project with `uv init`, it creates a `.python-version` file (e.g., containing `3.12`). This file, along with the `requires-python` field in `pyproject.toml`, tells `uv` which Python version to use for this specific project.

If you need to create an environment with a specific Python version, you can use the `-p` or `--python` flag:
```bash
# Create a .venv using Python 3.11, if available
uv venv -p 3.11
```

This separation of concerns is powerful: use a dedicated tool (like `pyenv`) for managing Python installations, and use `uv` for managing project environments and dependencies.

### Locking and Syncing
This is the core concept that makes the `uv`-style workflow robust and reproducible.

*   **Locking (`uv lock`):** A lock file (`uv.lock`) is a snapshot of the exact versions of every package in your project's dependency tree for a specific platform. When you run `uv add`, `uv remove`, or `uv lock`, `uv` calculates all dependencies based on `pyproject.toml` and writes them into `uv.lock`. Committing this file to your version control (e.g., Git) ensures that every developer on your team, as well as your deployment servers, can recreate the **exact** same environment.

*   **Syncing (`uv sync`):** The `uv sync` command is the enforcer. It reads the `uv.lock` file and makes your local virtual environment (`.venv`) an exact mirror of it.
    *   It installs any missing packages.
    -   It removes any packages that are present in your environment but not in the lock file.
    -   It ensures every package is at the exact version specified in the lock file.

This workflow guarantees consistency and eliminates "it works on my machine" problems. The typical developer workflow becomes:

1.  **Clone the repo:** `git clone ...`
2.  **Create the environment:** `uv venv`
3.  **Sync dependencies:** `uv sync`
4.  **Activate and work:** `source .venv/bin/activate`

When dependencies change, the process is just as simple:

1.  **Pull changes:** `git pull` (this updates `pyproject.toml` and `uv.lock`)
2.  **Re-sync:** `uv sync`

Your environment is now perfectly up-to-date with the project's requirements.