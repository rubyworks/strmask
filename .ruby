--- 
name: string::mask
company: RubyWorks
title: String::Mask
requires: 
- group: 
  - test
  name: qed
  version: 0+
- group: 
  - build
  name: syckle
  version: 0+
resources: 
  code: http://github.com/rubyworks/strmask
  mail: http://groups.google.com/group/rubyworks-mailinglist
  home: http://rubyworks.github.com/strmask
pom_verison: 1.0.0
manifest: 
- .ruby
- lib/strmask.rb
- test/test_strmask.rb
- LICENSE
- README.rdoc
- HISTORY
- VERSION
version: 0.3.1
copyright: Copyright (c) 2009 Thomas Sawyer
licenses: 
- Apache 2.0
description: String::Mask provides a kind-of string algebra useful for manipulating strings in in comparitive ways, eg. add, subtract, xor, etc.
summary: String Algebra
authors: 
- Thomas Sawyer
created: 2009-07-19
