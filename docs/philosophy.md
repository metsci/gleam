# Design Philosophy


## Imperative

The Gleam API is imperative. This makes the learning curve steeper than it might have been with a declarative API, but maximizes long-run flexibility, and gives calling code as much control as possible. Gleam is as indifferent as possible to the structure of calling code, and aims to be wrappable for React and other frameworks.


## Functions wherever possible, OO where necessary

The Gleam API uses functions where it can, and objects with mutable state where it must. Objects with mutable state are hard to reason about, but OO is a good choice when representing physical objects with mutable state -- in Gleam's case, mouse and keyboard with buttons that change between pressed and released, and a screen with pixels that change color.


## Versioning

Gleam uses [Semantic Versioning](https://semver.org/) in order to play well with JavaScript build tools. In Semantic Versioning a major version bump can indicate a major overhaul, or a small API change that will take 30 seconds to adapt to, or anything in between. If you need to get a sense of how much work it will be to upgrade from one Gleam version to another, your best bet is the [CHANGELOG](../CHANGELOG.md).
