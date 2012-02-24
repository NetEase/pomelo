/**

NAME
====

Joose.Manual.Contributing - How to get involved in Joose


GETTING INVOLVED
================

Joose is an open project, and we are always willing to accept bug fixes, more tests, and documentation patches. Commit bits are given out freely, and the "STANDARD WORKFLOW" is very simple. 
The general gist is: clone the Git repository, create a new topic branch, hack away, then find a committer to review your changes.

NEW FEATURES
============

Joose already has a fairly large feature set, and we are currently not looking to add any major new features to it. If you have an idea for a new feature in Joose, you are invited instead to create a JooseX module first.

At this stage, no new features will even be considered for addition into the core without first being vetted as a JooseX module, unless it is absolutely 100% impossible to implement the feature outside the core.

If you think it is 100% impossible, please come discuss it with us on IRC or via e-mail. However, your feature may need a small hook in the core, or a refactoring of some core modules, and we are definitely open to that.

Joose was built from the ground up with the idea of being highly extensible, and quite often the feature requests we see can be implemented through a couple of small and well placed extensions. Try it, it is much easier then you might think.


PEOPLE
======

As Joose has matured, some structure has emerged in the process.

- Contributors - people creating a topic or branch

    You.

    If you have commit access, you can create a topic on the main Joose.git, otherwise either give us your SSH key or create your own clone of the git://git.Joose.perl.org/Joose.git repository or fork of the GitHub mirror.
    
- Core Committers - people reviewing and merging a branch

    These people have worked with the Joose codebase for a while.

    They've been responsible for large features or branches and can help review your changes and apply them to the master branch using the basic "APPROVAL WORKFLOW".

    They are also fairly well versed in Git, in order to merge the branches with no mistakes (especially when the merge fails), and to provide advice to contributors.
    
- Cabal - people who can release Joose

    These people are the ones who have co-maint on Joose itself and can create a release. They're listed under "CABAL" in Joose in the Joose documentation. They merge from Master to Stable.

BRANCH LAYOUT
=============

The repository is divided into several branches to make maintenance easier for everyone involved. The branches below are ordered by level of stability.

- Stable (refs/heads/stable)

    The branch from which releases are cut. When making a new release, the release manager merges from master to stable. The stable branch is only updated by someone from the Cabal during a release.
    
- Master (refs/heads/master)

    The branch for new development. This branch is merged into and branched from.

- Branches (refs/heads/*)

    Large community branches for big development "projects".
    
- Topics (refs/heads/topic/*)

    Small personal branches that have been published for review, but can get freely rebased. Targeted features that may span a handful of commits.

    Any change or bugfix should be created in a topic branch.

STANDARD WORKFLOW
=================

        # update your copy of master
        git checkout master
        git pull --rebase

        # create a new topic branch
        git checkout -b topic/my-feature
    
        # hack, commit, feel free to break fast forward
        git commit --amend                       # allowed
        git rebase --interactive                 # allowed
        git push --force origin topic/my_feature # allowed

Then ask for a review/approval (see "APPROVAL WORKFLOW"), and merge to master. If it merges cleanly and nobody has any objections, then it can be pushed to master.

If it doesn't merge as a fast forward, the author of the branch needs to run

        git remote update
        git rebase origin/master # or merge

and bring the branch up to date, so that it can be merged as a fast forward into master.

No actual merging (as in a human resolving conflicts) should be done when merging into master, only from master into other branches.

Preparing a topic branch
------------------------

Before a merge, a topic branch can be cleaned up by the author.

This can be done using interactive rebase to combine commits, etc, or even git merge --squash to make the whole topic into a single commit.

Structuring changes like this makes it easier to apply git revert at a later date, and encourages a clean and descriptive history that documents what the author was trying to do, 
without the various hangups that happened while they were trying to do it (commits like "oops forgot that file" are not only unnecessary noise, they also make running things like git bisect or git revert harder).

However, by far the biggest benefit is that the number of commits that go into master is eventually reduced, and they are simple and coherent, making it much easier for people maintaining branches to stay up to date.

All large changes should be documented in [Joose.Manual.Delta][delta]


APPROVAL WORKFLOW
=================

Joose is an open project but it is also an increasingly important one. Many modules depend on Joose being stable. 
Therefore, we have a basic set of criteria for reviewing and merging branches. What follows is a set of rough guidelines that ensures all new code is properly vetted before it is merged to the master branch.

It should be noted that if you want your specific branch to be approved, it is your responsibility to follow this process and advocate for your branch. 
The preferred way is to send a request to the mailing list for review/approval, this allows us to better keep track of the branches awaiting approval and those which have been approved.

Small bug fixes, doc patches and additional passing tests.
----------------------------------------------------------

These items don't really require approval beyond one of the core contributors just doing a simple review.
    
Larger bug fixes, doc additions and TODO or failing tests.
----------------------------------------------------------

Larger bug fixes should be reviewed by at least one cabal member and should be extensively tested.

New documentation is always welcome, but should also be reviewed by a cabal member for accuracy.

TODO tests are basically feature requests, see our "NEW FEATURES" section for more information on that. If your feature needs core support, create a topic/ branch using the "STANDARD WORKFLOW" and start hacking away.

Failing tests are basically bug reports. You should find a core contributor and/or cabal member to see if it is a real bug, then submit the bug and your test to the [issues tracker](http://code.google.com/p/joose-js/issues/list). 
Source control is not a bug reporting tool.

New user-facing features.
-------------------------

Anything that creates a new user-visible feature needs to be approved by more then one cabal member.

Make sure you have reviewed "NEW FEATURES" to be sure that you are following the guidelines. Do not be surprised if a new feature is rejected for the core.


New internals features.
-----------------------

New features for Joose internals are less restrictive then user facing features, but still require approval by at least one cabal member.

Ideally you will have run the smolder script to be sure you are not breaking any JooseX module or causing any other unforeseen havoc. If you do this (rather then make us do it), it will only help to hasten your branch's approval.


Backwards incompatible changes.
-------------------------------

Anything that breaks backwards compatibility must be discussed by the cabal and agreed to by a majority of the members.

We have a policy for what we see as sane "BACKWARDS COMPATIBILITY" for Joose. If your changes break back-compat, you must be ready to discuss and defend your change.

RELEASE WORKFLOW
================

        git checkout master
        # edit for final version bumping, changelogging, etc
        # prepare release (test suite etc)
        git commit
        git checkout stable
        git merge master # must be a fast forward
        git push both
        # ship & tag

Development releases are made without merging into the stable branch.

EMERGENCY BUG WORKFLOW (for immediate release)
==============================================

Anyone can create the necessary fix by branching off of the stable branch:

        git remote update
        git checkout -b topic/my-emergency-fix origin/stable
        # hack
        git commit

Then a cabal member merges into stable:

        git checkout stable
        git merge topic/my-emergency-fix
        git push
        # release
        git checkout master
        git merge stable



PROJECT WORKFLOW
================

For longer lasting branches, we use a subversion style branch layout, where master is routinely merged into the branch. Rebasing is allowed as long as all the branch contributors are using git pull --rebase properly.

commit --amend, rebase --interactive, etc. are not allowed, and should only be done in topic branches. Committing to master is still done with the same review process as a topic branch, and the branch must merge as a fast forward.

This is pretty much the way we're doing branches for large-ish things right now.

Obviously there is no technical limitation on the number of branches. You can freely create topic branches off of project branches, or sub projects inside larger projects freely. Such branches should incorporate the name of the branch they were made off so that people don't accidentally assume they should be merged into master:

    git checkout -b my-project--topic/foo my-project

(unfortunately Git will not allow my-project/foo as a branch name if my-project is a valid ref).


THE "PU" BRANCH
===============

To make things easier for longer lived branches (whether topics or projects), the 'pu' branch is basically what happens if you merge all of the branches and topics together with master.

We can update this as necessary (e.g. on a weekly basis if there is merit), notifying the authors of the respective branches if their branches did not merge (and why).

To update 'pu':

        git checkout pu
        git remote update
        git reset --hard origin/master
        git merge @all_the_branches

If the merge is clean, 'pu' is updated with push --force.

If the merge is not clean, the offending branch is removed from @all_the_branches, with a small note of the conflict, and we try again.

The authors of the failed branches should be told to try to merge their branch into 'pu', to see how their branch interacts with other branches.

'pu' is probably broken most of the time, but lets us know how the different branches interact.


BRANCH ARCHIVAL
===============

Merged branches should be deleted.

Failed branches may be kept, but consider moving to refs/attic/ (e.g. http://danns.co.uk/node/295) to keep git branch -l current.

Any branch that could still realistically be merged in the future, even if it hasn't had work recently, should not be archived.


TESTS, TESTS, TESTS
===================

If you write any code for Joose, you must add tests for that code. If you do not write tests then we cannot guarantee your change will not be removed or altered at a later date, as there is nothing to confirm this is desired behavior.

If your code change/addition is deep within the bowels of Joose and your test exercises this feature in a non-obvious way, please add some comments either near the code in question or in the test so that others know.

We also greatly appreciate documentation to go with your changes, and an entry in the Changes file. Make sure to give yourself credit!


BACKWARDS COMPATIBILITY
=======================

Change is inevitable, and Joose is not immune to this. We do our best to maintain backwards compatibility, but we do not want the code base to become overburdened by this. 
This is not to say that we will be frivolous with our changes, quite the opposite, just that we are not afraid of change and will do our best to keep it as painless as possible for the end user.

The rule is that if you do something that is not backwards compatible, you must do at least one deprecation cycle (more if it is larger change). 
For really larger or radical changes dev releases may be needed as well (the Cabal will decide on this on a case-per-case basis).

The preference with regard to deprecation is to warn loudly and often so that users will have time to fix their usages.

All backwards incompatible changes must be documented in [Joose.Manual.Delta][delta]. Make sure to document any useful tips or workarounds for the change in that document.


AUTHOR
======

Nickolay Platonov [nickolay8@gmail.com](mailto:nickolay8@gmail.com)

Heavily based on the original content of Moose::Manual, by 

        Stevan Little <stevan@iinteractive.com>
        
        Chris (perigrin) Prather
        
        Yuval (nothingmuch) Kogman

COPYRIGHT AND LICENSE
=====================

Copyright (c) 2008-2011, Malte Ubl, Nickolay Platonov

All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
* Neither the name of Malte Ubl nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission. 

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. 

[delta]: Delta.html


*/
