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

	git users email@example.com email2@example.com
	gitp commit -m "Did the code"


## Components

### git users

This allows you to get or set git users. You can find out which users are configured using:

	git users

You can set one or two users by providing their github emails as arguments:

	git users email@example.com email2@example.com

Currently this only works with github accounts which have public email addresses, I plan to add an option for other users.

The first user entered is set as the normal git user, this user is used by normal git commands and stored in the git global config as `user.name` and `user.email`.

The second user is set as custom values in the git global config `author.email` and `author.name`.


### gitp

`gitp` is a wrapper executable for `git` which injects git committer and author environment variables to the command to allow two people to contribute to a commit. It alternates the committer and author in each commit.

Simply use it as you would use git e.g. `gitp commit -m "Fixed the thing"`


#### Aliasing

You can also alias this over `git` to use this in place of it. I prefer this because it prevents people from accidentally committing with a single user. Simply add `alias git='gitp'` to `~/.bashrc` (or `~/.bash_profile` on Mac).

