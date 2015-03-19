# Git pair
## Git pair programming tools

Allows you to commit with two users by making one the committer and the other the author. Also lets you switch users easily.

Credit to @roylines for the original idea in his [gits](https://github.com/roylines/gits) repo.


## Install

    npm install git-pair -g

This installs:
- A git alias [`git users`](#git-users)
- An executable [`gitp`](#gitp)


### Local install

You can also install git-pair locally:

    npm install git-pair

This will install the git alias to the local git config, to use gitp you need to run:

    ./node_modules/.bin/gitp


## Quickstart

Configure the users for your pair with `git users`, then use `gitp` instead of `git`:

    git users jane@example.com bob@example.com
    gitp commit -m "Did the code"


## Components

### git users

This alias allows you to get or set git users.
You can find out which users are currently configured using:

    git users

You can set users using their email addresses:

    git users jane@example.com bob@example.com

This looks up git usernames from GitHub, alternatively you can specify usernames explicitly:

    git users jane:jane@example.com bob:bob@example.com

The users are stored as values in `git config`. The first user entered is always the normal git user.


### gitp

`gitp` is a wrapper executable for `git` which injects git committer and author environment variables to the command to allow two people to contribute to a commit. It alternates the committer and author in each commit.

Simply use it as you would use git e.g. `gitp commit -m "Fixed the thing"`


#### Aliasing

You can also alias this over `git` to use this in place of it. I prefer this because it prevents people from accidentally committing with a single user. Simply add `alias git='gitp'` to `~/.bashrc` (or `~/.bash_profile` on Mac).

