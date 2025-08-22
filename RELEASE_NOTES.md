# Release Notes

## Version 0.0.127 Patch

### Lasereyes-Core

Upgrade from `0.0.48` to `0.0.49`

- XVerse Provider module has been enriched. An addition to the `MessageSigningProtocols` has been made which uses the BIP322 protocol during the request for 'signMessage'. This new protocol should enhance security and confirm the authenticity of messages in a bit more foolproof way.
- For those who find all things beautiful in perfect alignment, we've adjusted the spacing of some arguments. All you tidyfreaks can find solace in the sheer neatly packed lines of properties now.

### Lasereyes-React

Upgrade from `0.0.43` to `0.0.44`

Not striving to make any big splash here, just some routine backstage adjustments to keep the lasereyes-react package tuned and humming smoothly.

### Lasereyes-Vue

Upgrade from `0.0.9` to `0.0.10`

Striking ten with lasereyes-vue. No core changes here either, just the next effortless gate in our endless journey of version updates.

### Misc

- Mysterious things do happen in code! A newline was found innocent and restored to its rightful place at the end of a file.

Let's dive in the sea of codes again until we meet for the next release, folks! Live Long and Tidy.

# Version: 0.0.126

Oh look, we did some things. Surprise, surprise.

To start, we improved the code structure in `App.tsx` and `WalletCard.tsx`. It's not like you'd notice, but we spent a bazillion cups of coffee to tweak that, so humor us. It was also necessary due to life-or-death alignment issues that lasted for approximately millimeters.

Speaking of `WalletCard.tsx`, borderline ground-breaking changes have been made to the class names handling of the 'connected' badge. Breaking news, right?

Since we were in a rather jolly mood, we boosted up the version of `lasereyes-core` to 0.0.48. Just making sure that the freshness of the code aligns with our coffee.

Speaking of soaring numbers, `lasereyes-react` is now at version 0.0.43, and `lasereyes-vue` hit version 0.0.9. Clearly, you see we've been busy.

But the pièce de résistance of this update - the `OpNetProvider`. After hours of soul-searching, we've reenabled it in our core client. Also, we beat around the bush in its code, because let's not lie, we all have those 'what was I thinking?' moments. I mean come on, we're coders, not fortune tellers.

Oh and remember `getBTCBalance`? Neither do we. So we sent it to a very long vacation. It won't be missed.

And guess what? We even updated the provider enumerator and added the `OP_NET` in supported wallets. Yes, hold your breaths – we are revolutionary like that.

No, there is no need to thank us.

# Release Notes

## Version: 0.0.125-rc.8

The sunny skies over the `lasereyes` repository are gleaming brighter than ever because we heard your mumbles! Folks from QA would be delighted to know and test in their over-caffeinated enthusiasm that we have a new release candidate available as Version 0.0.125-rc.8. Bonus? We've even bumped the versions of the packages. Let's get into it.

### @kevinoyl/lasereyes-core [0.0.47-rc.5]

The core package saw a version update from 0.0.46-rc.4 to 0.0.47-rc.5. This isn't just a number change but a hard-work-drenched improvement. We promise, not a single piece of cake was harmed during this transition! Strap up and prepare to experience enhancements of the sort you've never seen before.

### @kevinoyl/lasereyes-react [0.0.42-rc.4]

And we didn't stop at the core. No sir, we've gone farther! Our React package, in all its glory, evolved from version 0.0.41-rc.4 to version 0.0.42-rc.4. There may be no additional bite-sized burgers in this release, but we are definitely filling up on React goodness.

### @kevinoyl/lasereyes-vue [0.0.8-rc.1]

Our Vue package took some time for self-discovery and has metamorphized from version 0.0.7-rc.1 to version 0.0.8-rc.1. Though this might seem like just an incremental update, it’s like hiring your second cat, small change, monumental effect!

Please do the needful to update to the latest versions where necessary and thank you for your continued support. Also, don't forget to drink some water between the caffeinated drinks. Please!

# Release Notes: Version 0.0.123-rc.6

This release - version 0.0.123-rc.6 - is a tour de force to excite even the most fatigued developers. We've managed to remove all those extra blank lines in our ReadMe files that were desperately clinging to existence, causing such unnecessary scroll fatigue. They're now vanished into the ether.

## Details of Changes:

### 1. LaserEyes Core: Version change 0.0.46-rc.1 -> 0.0.46-rc.2

The moment you've all been waiting for – a version change in the @kevinoyl/lasereyes-core in package.json file! Cherish this moment - there aren't many like this in life.

### 2. LaserEyes React: Version change 0.0.40-rc.1 -> 0.0.40-rc.2

For those of you who were growing tired of the old version of @kevinoyl/lasereyes-react in our package.json file, rejoice! We've liberated you from the burden of an old version, by moving from 0.0.40-rc.1 to 0.0.40-rc.2. A giant leap for developer kind!

### 3. LaserEyes: Change of Installation Command

In the lasereyes README.md, we've replaced the command `pnpm add @kevinoyl/lasereyes` with `yarn add @kevinoyl/lasereyes`. Because why not? We thought it wasn't confusing enough, so we decided to turn some tables.

### 4. LaserEyes: Version change 0.0.123-rc.4 -> 0.0.123-rc.6

At last, we've the long-awaited update in the heart of our project, the version change of @kevinoyl/lasereyes package from "0.0.123-rc.4" to "0.0.123-rc.6!". Please play fanfare music as you read this.

Thank you for your continued support and keep an eye out for thrilling changes in our upcoming releases.

## Version 0.0.123-rc.4 Release Notes

In the pursuit of fine craftsmanship and making your developer life just that much easier, we've managed to squeeze in some updates for this release.

Manipulating the flux capacitor, we've introduced a new **Create .npmrc file** step within our GH Actions workflow. This step is just about as exciting as someone methodically folding laundry, but we promise it's important.

This step **creates an .npmrc file** using scarcely believable lines of code. It elegantly writes your `${{ secrets.NPM_TOKEN }}`, (obtained from your GitHub secret) for authentication to npm registry into the .npmrc. And no, just to set the record straight, NODE_AUTH_TOKEN isn't a band name; it’s an environment variable used for npm authentication.

Moreover, as part of our exquisite error handling, we've ensured that this step is skipped over if critical steps lead to a failure. Because let’s face it, adding a cherry on top of a disaster-cake isn't really that appetizing.

That's all folks! We promise to continue tweaking things behind the scenes to help keep you coding and not wrestling with workflow configurations. Stay tuned for more exciting (and definitely useful) updates in our next versions!

In this release, there have been some significant adjustments across three core packages of the LaserEye project - LaserEyes Core, LaserEyes React, and LaserEyes itself. Let's break it down. Some will say these changes are out of this world, but don't worry, we remain grounded.

**@kevinoyl/lasereyes-core:**

Our core library had a suitable increase from version 0.0.45-rc.2 to 0.0.45-rc.3. There may or may not be additional white spaces added to the README. We won't validate your life by divulging that information.

**@kevinoyl/lasereyes-react:**

We moved LaserEyes React from version 0.0.39-rc.0 to 0.0.39-rc.1. Once again, an enigma is introduced via mysterious blank lines in the README file. These strange additions will continue to impress or confound - we're not mind readers, guys.

**@kevinoyl/lasereyes:**

The updates to LaserEyes are far more objective. We've leveled up from version 0.0.122-rc.1 to 0.0.122-rc.4. Don’t you feel better knowing that? We also made some tweaks to the example usage in the README, showing how to use LaserEyes with React. Frankly, it's revolutionary - a sphere-shaped revolution, if you will.

In practice, we replaced `useWallet` with `useLaserEyes`. Don't confuse this with your ocular motor function, it will not improve your vision. Rather, it reflects changes in your connection status. But that seems self-evident, doesn't it? We still kept the `connect` function but have it now accept `UNISAT` as a parameter to tell you that you are, indeed, connecting to something.

The connection status confirmation is now given through `address` instead of `wallet` - sounds more homey, doesn't it? However, don't put that as your mailing address, you might not receive your Amazon packages.

Dependencies have been updated to point to a workspace, giving us that cross-package synergy we all accidentally refer to during office stand-ups.

And that’s it for this release, aren’t you glad you read this? Stay tuned for more updates and thinly veiled inexplicable humor.

# Release Notes

Version: 0.0.121-rc.1

## Updates in `@kevinoyl/lasereyes-react`

We've successfully incremented your favorite package `@kevinoyl/lasereyes-react` from version `0.0.37` to `0.0.38-rc.0`. This shift may not have started a revolution, but surely your code is enjoying a breath of fresh air.

## Fine Tuning in `@kevinoyl/lasereyes`

In our campaign to make the world a better place, we figured we'd start by changing version `0.0.120` of `@kevinoyl/lasereyes` to `0.0.121-rc.1`. Alas, the new version carries all the wisdom of its predecessor, plus some bonus rationale.

Now, remember those `@kevinoyl/lasereyes-core` and `@kevinoyl/lasereyes-react` dependencies? They're now secured with the power of `workspace:*`, unifying versions across your project like never before.

## Additional Tinkering

Here's a tag you may not have been expecting: `bip39`, upgraded to `^3.1.0`. This surprising and unanticipated change was actually carried out in a smooth operation that did not involve a SWAT team.

That's it for this round of version changes. Remember, somewhere out there, a digit is laughing. Happy coding!

## Version 0.0.120-rc.4 Release Notes

In this update, numerous changes were implemented in order to harness the power of the Lasereyes platform more efficiently. We hope these changes will be as enlightening to you as a laser eye surgery. Without further ado, here are the changes brought in this new version.

- First up, we've had a minor re-adjustment in `WalletCard.tsx`. The transmission of network parameter in the `inscribe` function was judged unnecessary and has thus been omitted. Less is more, you know.

- Our talented design team just couldn't resist adding a little extra shine to our `LaserEyesLogo`. The `className` attribute has now replaced the use of the `props` spread syntax to provide the `logo` SVG. The result is a more customizable logo, ready for any situation you feel needs a bit more Lasereyes sparkle.

- `lasereyes-react` libraries have been upgraded to version 0.0.37-rc.3. The libraries are fresher and improved—think of them like laser-sliced bread.

- A change was also made to the `vite.config.ts` file in the `lasereyes-react` package. The `react()` function in the plugins array is now cast to `UserConfig["plugins"]`, shooting lasers at the risk of type assertion failure.

- With the main `lasereyes` package, it's time to celebrate its upgrade to version 0.0.120-rc.4. Even numbers are not necessarily better, but they indicate continuous progress!

- Lastly, please note that changes included in the `pnpm-lock.yaml` have not been described because, well, we agreed not to discuss the lock file or anything outside the main version changes, remember?

We hope this release brings you improved performance, lovelier visuals, and a smoother experience overall. Enjoy the new Lasereyes experience!

Release Notes:

**Version: 0.0.119-rc.1**

## General Changes

In this whimsically phenomenal update, (don't worry, the whimsy ends here), we've got an array of changes aimed at improving your interaction with our application. For starters, the version has been incrementally upped to 0.0.119-rc.1, which might not seem comedic, but trust me, you don't want to be laughing at this point.

## Bug Reports and Issue templates

There have been some structured adjustments when it comes to submitting your issues. We've added new templates for bug reports, document improvements, feature requests, security vulnerabilities, and support questions. So please make use of them and provide us with eloquent descriptions of all of your woes, cries, and pleads for enhancements to our code base.

## Mainness and Testness... I mean Mainnet and Testnet!

Now onto application logic modifications. We've ensured that your mainnet and testnet existential crisis is lessened, by enabling you to easily switch between the different networks via a new function, `switchNet`. The addition of this function within the `Home` component and its accompanying calls within the `App` component ensures seamless navigation through the sprawling labyrinth of network options, lifting the burden of making these hefty decisions on your own.

## React App Modifactions

In line with this existential network crisis mitigation, some ad hoc component modifications have also been made within the React components. Your question and confusion of networks will now be handled elegantly with the addition of newly implemented error handling and conditional functionality. But beware, using `tb1` addresses on mainnet could lead to unexpected disconnection. We've added necessary checks and informative error messages to guide you on this journey.

## Provider Updates

The git diff has a mare's nest of modifications to several wallet providers. Notably, Thunderbird (I mean `UnisatProvider`, for all you XMen fans) received a renovation where a method previously deemed unnecessary has been stealthily brought back to the game. Check it out to see what's cooking!

## Conclusion

In conclusion, the joke's on you if you thought this was about making you chuckle. Our primary objective, like any good bureaucracy, is to enhance your user experience. Update to the new version and enjoy the refined, bug-less (we hope) world of our application.

Oh and if you're aware of any new jokes, please submit them via the new 'bug report' template under the label 'documentation'. Just kidding! Or am I?

That's all folks! Enjoy the new version! And remember, laughter is the best form of bug eradication!

Welcome to **Version 0.0.118-rc.1**! Make sure you had your coffee today, because we've got a well-rounded slate of updates that may require that extra caffeine boost. Here's what changed:

**`lasereyes-core` package:**

- Fanfare, please! We've ascended to **version 0.0.43-rc.0** from the old and rusting 0.0.42. If that's not worth a drum roll, I don't know what is.
- Look who's shown up in our `ProviderEnumMap`! It's **Phantom**! Yes, we've added 'phantom' to our menagerie of supported wallet providers. You could say it 'appeared out of nowhere.'
- But where, oh where, can you find this elusive Phantom? We're so glad you asked! Navigate to 'https://phantom.app/download', where you can download the Phantom wallet. See, we're full of helpful tips!

**`lasereyes-react` package:**

- We're marching to the beat of progress, and that means upgrading to **version 0.0.35-rc.0** from version 0.0.34. It's these small steps that make us feel warm and fuzzy inside.

**`lasereyes-vue` package:**

- Vue enthusiasts, rejoice! We've refined `lasereyes-vue` to **version 0.0.4-rc.0** from a respectable but slightly less shiny 0.0.3.

**`lasereyes` package:**

- The Mother of Packages has advanced to **version 0.0.118-rc.1**! This update might be your favorite; it's certainly ours.
- While we're at it, we've updated dependencies too. You'll find `lasereyes-core` and `lasereyes-react` sitting comfortably in the workspace.

Alright, back to your regularly scheduled programming activities! Go forth and conquer with these exquisite updates in your toolkit.

Release Notes Version: 0.0.115-rc3

Dear user, we believe in continuous improvement, so here we are again with yet another version update. _Play celebratory trumpet sounds._ The upgrades might not be apparent, but boy, have we been working hard behind the scenes!

1. **README.md Update:** The herding cats didn't seem to do the trick, so we have updated the gif file's source link. Now, crossing our fingers, the herding_cats.gif image should load just fine and not cause any 404 crisis. Thank your patience!

2. **Lasereyes-core Version Update:** You might not have noticed, but we actually changed our lasereyes-core version from 0.0.39 to 0.0.40-rc.2. Yep, we're that attentive to details. Next stop, world domination!

3. **Lasereyes-react Version Update:** We have also updated lasereyes-react. Goodbye version 0.0.31, let's welcome the new and slightly improved version 0.0.32-rc.1. Because improvements matter, no matter how small they appear.

4. **Global Version Update:** And finally, we saved the best for the last. Drumrolls, please... we've nudged our global version from 0.0.114 to 0.0.115-rc.3! We're one step closer to version 1.0, friends. One jolly step closer.

5. **Minor Dependencies Shift:** Lastly, we have changed the dependency requirements within the lasereyes package for "@kevinoyl/lasereyes-core" and "@kevinoyl/lasereyes-react". They now point to workspace:\*. There will be no apparent changes or impact due to this update, but we thought you'd like to know... just because.

CAUTION: Please avoid looking directly into the laser eyes. Enjoy the version update!

- Faithfully yours, LaserEyes team.

## Version: 0.0.114-rc.1

#### Tiny step forward, giant leap for kind

- We've updated the `version` of `@kevinoyl/lasereyes-core` from `0.0.38` to `0.0.39-rc.1` - a minor bump. But, you know, even the Moon is reached by small steps, and we all know what's happened there, right?
- In the file `op-net.ts`, we've added `?` after `this.library` for method `removeListener`. Now, if `this.library` decides to play hide and seek game, we're prepared. We're always one step ahead.

- Similar changes in the file `unisat.ts` are also observed. `if (!this.library) return` is the new mantra for method `removeListener`. We believe in treating every code file with equality.

- Paving way for the future, `version` in `@kevinoyl/lasereyes-react` has been moved up from `0.0.30` to `0.0.31-rc.0`. Small progress, but we never despise humble beginnings.

- Following the trend, `version` in `lasereyes` got an update from `0.0.113` to `0.0.114-rc.1`. We're keeping up with the trend, aren't we?

- Lastly, a teensy-weensy change in `generate_release_notes.py`. Someone was kind enough to correct the spellings of `anything` and `other`. We truly believe that every letter counts, literally!

Leaps and bounds are reserved for superheroes. For us, slight numerical tweaks are our bread and butter. So here’s to many more atomic yet significant bumps in versions to come! Cheers!

**Version: 0.0.113-rc.18**

# "You'll Never See These Updates Coming" Release Notes

Oh hey there! Surprised to see you here, but since you are, let's talk about the changes in our swanky new update.

1. **Your favorite @kevinoyl/lasereyes-core** couldn't stay at "0.0.36-rc.5", because well, change is the only constant in life. It now boasts a shiny version "0.0.38-rc.6". Nothing gets rid of Monday blues like new version numbers, amirite?

2. In the spirit of the age-old tradition of "always leave things slightly better than you found them", **@kevinoyl/lasereyes-react** decided to shake things up from "0.0.29-rc.7" and stepped up to "0.0.30-rc.7". We’ve got a good feeling about the number '30'.

3. Raising the stakes, we present to you eight – count 'em, EIGHT – new additions to your @kevinoyl/lasereyes-react exports. Welcome **LeatherLogo, MagicEdenLogo, OkxLogo, PhantomLogo, OylLogo, UnisatLogo, WizzLogo,** and **XverseLogo.** More is always better, except when it’s worse. In this case, we're certain it's better.

4. Last, but not the least, the self-titled celebrity **@kevinoyl/lasereyes** has leapfrogged from the quaint "0.0.113-rc.16" to the majestic "0.0.113-rc.18". Yeah, you saw that right, we completely skipped 'rc.17'. Because we are mavericks who play by our own rules.

So, buckle up, update your packages, and remember – we make these changes because we care... and because it's our job.

Keep on shining folks! Until the next wave of updates sweeps us away!

Phew! So much work, so little praise. Presenting to you, dear (and often thankless) users, Version 0.0.104-rc.2. Your gift for being so committed to this journey with us. Let's check the upgrades, shall we?

1. Delight in GitHub Release Syntax: It seems our developers have finally learnt to name their GitHub releases properly. Goodbye "github.ref", Hello "github.ref_name"! It took us a couple of commits but hey, better late than never, right?

2. Version Updates: Routine stuff really, but we'll mention it like it matters (because it totally does):

   - "lasereyes-core" got an upgrade to version "0.0.34-rc.0" from "0.0.33". Whoop-de-doo!
   - "lasereyes-react" too, was updated to version "0.0.27-rc.2" from "0.0.26". We could almost see the anticipation in your eyes.
   - And don't forget "lasereyes" itself, bumped up to version "0.0.104-rc.2" from "0.0.103". Yep, we're growing up!

3. README file found a purpose! It finally broke free from '92 and is now '95. Watch out for those three new thrilling lines of whitespace. They may be invisible to the naked eye, but they're there!

4. We bid farewell to workspace dependencies. They were great, but we're just better apart (specifically moved from workspace to defined versions for lasereyes-core and lasereyes-react dependencies). It's not them, it's us.

5. Scrapped orphans: We made the hard decision to let go some packages that were just taking up space - now making your code (and life) cleaner. You're welcome!

Finally, while we're on the topic of things you didn't ask for, but we provide anyway, please marvel at our newfound passive aggressiveness. That's right dear folks, our release note generator script had an attitude adjustment. It will now churn out "detailed, sometimes hilarious release notes" instead of plain ol' "detailed" ones.

But don’t worry, we will "always ensure we are informative and helpful," even though the world may not always appreciate our cheeky sense of humor. Make sure you appreciate it (or else we might have to make other trivial, but time-consuming changes). Enjoy Leo (aka Version 0.0.104-rc.2)!

# Release Notes for Version: 0.0.103-rc.18

## Updates

1. In our Github action workflow for releases, we've added a new command to rebase the main branch from origin after the release notes commit is done. This will help to synchronize the main branch with any new commits made during the build process, ensuring that the following push to the main branch is up-to-date.

2. We've updated the version of `lasereyes-core` from `0.0.32` to `0.0.33-rc.3`.

3. We've updated the version of `lasereyes-react` from `0.0.25` to `0.0.26-rc.7`.

4. Version of the `lasereyes` package has been updated from `0.0.102` to `0.0.103-rc.18`.

5. We now use `workspace:*` for dependencies on `@kevinoyl/lasereyes-core` and `@kevinoyl/lasereyes-react`.

## Dependency Changes

1. In `lasereyes` package, the dependencies for `@kevinoyl/lasereyes-core` and `@kevinoyl/lasereyes-react` have switched from specific versions to workspace:\*. This designates that the local versions of these packages should be used, which can speed up the development process as changes in the local packages are immediately available.

2. Our `pnpm-lock.yaml` file has been updated to indicate this shift to using the workspace packages. Now, instead of pointing to a specific version of the `lasereyes-core` and `lasereyes-react` packages, they point to the local workspace version.

## Misc

Two empty line spaces have been added to the end of the `@kevinoyl/lasereyes-react` README.md file.

# Release Notes

## Enhancements

- The environment for the GitHub action workflow 'generate-release' is now set to 'prod'.

## Package Updates

- Updated `lasereyes-core` package version from `0.0.0-rc.2` to `0.0.0-rc.3`.
- Updated `lasereyes` package version from `0.0.37-rc.18` to `0.0.37-rc.19`.

## Documentation

- A test line has been added to the `README.md` file in the `lasereyes-core` package folder.

# Release Notes

In this update, we've made several changes and improvements.

## Changes

### Update in GitHub Action Workflow Configuration

- The method to ensure single 'v' in `tag_name` has been modified. Now instead of taking `tag_name` from the `env.lasereyes_version` environment variable, it takes from `needs.bump-versions-main.outputs.lasereyes_version` output. This change is made in the `.github/workflows/release.yml` file.

### Updates in Documentation

- In `lasereyes-core` package, a new paragraph "test" has been inserted at the end of the README file.

- Similarly, in `lasereyes-react` package, one more paragraph named "test" has also been added at the end of the README file.

Please make sure to update your cloned repositories to reflect these changes.

# Release Notes

## Configurations

- The git user is now configured in the GitHub workflow release.yml file. The user email is set to "github-actions[bot]@users.noreply.github.com" and the username set to "github-actions[bot]".

## `lasereyes-react` package

- Updated the version of the `lasereyes-react` package from `0.0.1` to `0.0.0-rc.18` in both, the package.json and the package-lock.json files.

- An additional test line was added to the README.md file of `lasereyes-react`.

## `lasereyes` package

- Downgraded the version of the `lasereyes` package from `0.0.38` to `0.0.37-rc.17` in the package.json file.

All of these changes are meant to better the reliability and functionality of the package. Please update your packages to these versions for an improved user experience.

# Release Notes: v0.0.36

## Detailed Updates:

### General:

- Transitioned to new versioning format for the package, now using release candidate (rc) versioning.

### Package Updates:

1. `@kevinoyl/lasereyes-core`:

   - The package version has been updated from "0.0.6" to "0.0.7-rc.0".

2. `lasereyes-react`:

   - The package version in the package-lock.json file was updated from "0.0.4" to "0.0.5-rc.0".
   - The package version in the package.json file got updated from "0.0.4" to "0.0.5-rc.0".

3. `@kevinoyl/lasereyes`:
   - The package version in the package.json file was updated from "0.0.36" to "0.0.37-rc.0".

#### Please note:

A release candidate (RC) version number indicates that the developers think the software is ready for its final release but want to make sure through testing; more changes may come before the final release, but they should be minor.

The updated packages should now be tested thoroughly before the final release.

These changes help to better track the progress of new features and bug fixes, by providing an advanced snapshot of what's changing in each package.

## Release Notes for Version: v0.0.35

In this new version, several updates have been made to the packages, mainly targeting:

1. **Lasereyes-core:**

   The package version has been upgraded from `v0.0.5` to a release candidate `v0.0.6-rc.0`. This release candidate will undergo further testing before a full version update.

2. **Lasereyes-react:**

   Both the `package.json` and `package-lock.json` files have been updated. The package version has been updated from `v0.0.3` to a release candidate version `v0.0.4-rc.0` reflecting potential upcoming changes expected to be fully implemented in the version `0.0.4`.

3. **Lasereyes:**

   The package version has been updated from `v0.0.35` to a release candidate `v0.0.36-rc.0`.

Please note that all the updates are related to the versions of the packages. More information about any new features or fixes will be provided as they come in future updates. Until then, the users can continue with the same feature set as the previous version.

# Release Notes

## Version v0.0.34

### Packages Updated

- **@kevinoyl/lasereyes-core**

  - Version bumped from `0.0.5-rc.3` to `0.0.5-rc.4`.

- **@kevinoyl/lasereyes-react**

  - Updated `package-lock.json` and `package.json` files.
    - Version bumped from `0.0.3-rc.2` to `0.0.3-rc.3` in both files.

- **@kevinoyl/lasereyes**
  - Version updated from `0.0.34` to `0.0.35-rc.0` in the `package.json` file.

### Summary

This release primarily involves updates to the package versions across the libraries for `@kevinoyl/lasereyes-core`, `@kevinoyl/lasereyes-react`, and `@kevinoyl/lasereyes`. No notable features or bug fixes were introduced in this version.

# Release Notes - Version v0.0.33

## General

New version v0.0.33 brings a few important updates across several packages. Enhancement in package versions are introduced in this update.

### Details

Here is the summary of the version changes:

- **@kevinoyl/lasereyes-core**
  The version has been updated from v0.0.5-rc.2 to v0.0.5-rc.3.

- **lasereyes-react**
  The versions in both `package-lock.json` and `package.json` files have been updated from v0.0.3-rc.1 to v0.0.3-rc.2.

- **@kevinoyl/lasereyes**
  The version has been updated from v0.0.33 to v0.0.34-rc.0.

Please note the new changes and update your packages accordingly for optimal performance and latest features.

Remember to always start with backing up your application and data before applying any updates. Make sure to test in a controlled environment that resembles your production environment before moving forward with these upgrades in your production environment.

# Release Notes

## Version: v0.0.33-rc.0

In this new release, the main highlight is the version bump of `@kevinoyl/lasereyes` from version `0.0.32` to `0.0.33-rc.0`. This new version is a release candidate and this change reflects the preparation for the next potential stable release.

No other documented changes were made to the codebase in this update.

Please note: This release, being a release candidate, is not intended for production use. It is released for testing purposes, to catch any critical issues before the final release.

# Release Notes

Version: v0.0.32-rc.0

## Changes

- The package version has been updated from "0.0.31" to "0.0.32-rc.0". This signifies that we have moved onto the next release cycle.

Please note that this is a release candidate version(-rc.0), meaning it's not the final version. Rather, it's a version we believe to be stable and includes all features we intend to deliver, but it's not yet thoroughly tested to be declared as stable.

Remember to update your dependencies to ensure compatibility with this new version.

# Release Notes for v0.0.31-rc.0

## Updates:

1. Version Upgrade: The package has been upgraded from version `0.0.30` to version `0.0.31-rc.0`.

No additional changes have been made in the package's modules or structure as per the git diff provided. Please ensure to update your dependencies to stay up-to-date with the latest features and improvements of the "@kevinoyl/lasereyes" package.

# Release Notes

#### Version: v0.0.28

## Updates

- The package version of '@kevinoyl/lasereyes' has been upgraded from "0.0.29" to "0.0.30-rc.0"

Please note that this is a release candidate version, so it might not be completely stable or might contain bugs. The purpose is to gather feedback and make improvements before the final stable version is released.

As always, the main distribution of this package can be found in the "./dist/index.js" and the UMD build can be found at "./dist/index.umd.cjs".

Please let us know if you encounter any issues or have feedback on this version, your input is invaluable for our progress.

Thank you for supporting our work. We are looking forward to serving you better with each update.

# Release Notes: v0.0.26 to v0.0.28-rc.0

## Updated Information

The package version for "@kevinoyl/lasereyes" has been incremented from v0.0.27 to v0.0.28-rc.0.

## General Changes

- Updated the package version in the package.json file of "@kevinoyl/lasereyes" from "0.0.27" to "0.0.28-rc.0".
- No changes have been made to the "name", "private", "type", "main", and "module" fields in the package.json file.

## NOTE:

This release (v0.0.28-rc.0) appears to be a release candidate (as indicated by the 'rc.0' suffix). This version might not be fully tested and could contain incomplete features. Therefore, it is recommended to use this version carefully in production systems.

## Lasereyes v0.0.26-rc.0 Release Notes

In this release, only the version number has been updated. No feature enhancements or issue fixes were detailed.

### Changes:

- Updated the package's version from `0.0.25` to `0.0.26-rc.0`.

As this version suggests, this is a release candidate (rc.0) for the 0.0.26 version of the Lasereyes package. This will undergo testing before it is officially released as version 0.0.26.

Note: Since there were no other changes mentioned, it's assumed that improvements, bug fixes, or feature additions have not been incorporated in this update.

Ensure that the compatibility and functionalities align with your dependencies before updating to this version.

# Release Notes

### Package

Lasereyes by Omnisat

### Version

Updated to version 0.0.24-rc.0 (from previous version 0.0.23)

### Changes

This update does not include any feature or usability changes, but it represents a new release candidate (rc). The functionality remains same as per the previous 0.0.23 version.

Please continue to test and report any found issues. As this is a pre-release version, it's recommended not to deploy it into production environments as the final version might still have changes based on feedback from testing of this release candidate.

As always, we appreciate your continued support and assistance in testing this version.

Release Notes:

## Version: 0.0.22-rc.0

#### Changes:

- Updated the package version from 0.0.21 to 0.0.22-rc.0.

Please note that this version is a release candidate, which means that it isn't deemed stable yet. It's meant for testing the next release's functionality in a real-world scenario.

As always, you are more than welcome to participate in the testing. Your feedback helps us greatly in improving the product!

Please continue using the package and report back any bugs, issues you encounter, or improvements you'd like to see. Your help is very much appreciated!

# Release Notes for @kevinoyl/lasereyes version 0.0.20-rc.0

## Changes:

- The version of the package "lasereyes" under @omnisat has been updated. It was previously at version 0.0.19 and is now at version 0.0.20-rc.0. This update represents a release candidate for the new version. After testing, if no issues are found, this will become the official 0.0.20 release.

## Update:

- As with every software update, it is recommended to first test this version in a staging/development environment before deploying it to production servers.

Please checkout the new version and let us know if you encounter any issues, so we can get them resolved before the final release.

As always, we appreciate your support and contributions to making our software better.

# Release Notes for @kevinoyl/lasereyes version 0.0.19-rc.0

## Changes:

- The package version has been updated from 0.0.18 to 0.0.19-rc.0, indicating that this is a release candidate for version 0.0.19 and is potentially ready for final release after testing.

Note: No other changes have been made to the package in this version, thus users can expect the same functionality as in the previous version. However, with this being a release candidate, feedback on any existing issues is highly appreciated before progressing to the final release of version 0.0.19.
