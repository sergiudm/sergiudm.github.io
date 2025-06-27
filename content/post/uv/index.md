---
title: "90% You Need to Know about uv"
date: 2025-06-12 00:00:00+0000
description: "An elegant tool to manage Python Projects."
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
  - [Removing Dependencies](#removing-dependencies)
  - [Managing Python Versions](#managing-python-versions)
  - [Locking and Syncing](#locking-and-syncing)

## conda/pip style usage
If you just want a quick way to use uv like you would with conda or pip, then the following commands should help you get started:
### Creating a New Virtual Environment
```bash
uv venv <myenv> --python 3.x
```
After running the above command, you will have a `./<myenv>` directory containing the new virtual environment. (This suggests that the name of the virtual environment is not important, as long as it is unique in the current directory. So you can run a simpler command `uv venv` to create a virtual environment with the default name.)

### Removing Virtual Environments
As you might have guessed, removing a virtual environment is as simple as:
```bash
rm -rf <myenv>
```

### Activating/Deactivating the Virtual Environment
To activate the virtual environment, you can use:
```bash
. <myenv>/bin/activate
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
uv pip freeze
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
If you want to take full advantage of uv's features, you can use it in a more idiomatic way. Here are some common tasks and how to perform them with uv:
### Creating a New Project
### What is a Project?
A project is all the files(containing metadata) and directories that are needed to run your Python application. It includes the source code, configuration files, and any other resources that are required to run the application. To see the structure of a uv project, the simplest way is to create one:
```bash
uv init <myproject>
```
This will create a new directory called `<myproject>` with the following structure:
```
myproject
├── .gitignore
├── .python-version
├── main.py
├── pyproject.toml
└── README.md
```

### Adding Dependencies
Now you want to add some packages to your project, say `numpy` and `requests`. You can do this by running:
```bash
uv add numpy requests
```
After running this command, you will see that the `pyproject.toml` file has been updated with the new dependencies:
```toml
[project]
name = "test"
version = "0.1.0"
description = "Add your description here"
readme = "README.md"
requires-python = ">=3.12"
dependencies = [
    "numpy>=2.3.1",
    "requests>=2.32.4",
]
```
together with a new file, `uv.lock`, which contains the exact versions of the packages that were installed. 
Also, a new directory `./venv` has been created, which contains the virtual environment for the project. You can activate it using the aforementioned command.

Note that if you use `uv pip install <package>`, it will install the package in the current virtual environment, but it will not update the `pyproject.toml` file or create a `uv.lock` file. So it is recommended to use `uv add <package>` instead.

### Removing Dependencies


### Managing Python Versions

### Locking and Syncing

