---
title: "5+ ways iOS 9 might break your app"
date: 2015-07-14
author: Paul Burt
category: Howto
tags:
  - testing
  - ios9
  - mobile
  - apple
---
What are you waiting for? iOS 9 is in public beta. [Download it](https://beta.apple.com/sp/betaprogram/) and get testing! There's no time like the present.

While you're waiting on the download, let's talk about [what's new](http://arstechnica.com/apple/2015/07/first-look-ios-9-public-beta-is-the-update-the-ipad-deserves/). By that I really mean, what's likely to mess up your app? Whether you're on web or native, the new iOS introduces a few extra edges you'll want to consider.

The big ones are multitasking, low-power mode, and keyboard additions.

## Multitasking
This release sees a lot of love going towards the iPad. Three new tablet views are:

- Slide Over
- Split View
- Picture in Picture (for video only)

These features are only available on the Mini 2+ and Air 1+ iPads. On this releasse, Apple was kind enough to [highlight spots](https://developer.apple.com/library/prerelease/ios/documentation/WindowsViews/Conceptual/AdoptingMultitaskingOniPad/index.html#//apple_ref/doc/uid/TP40015145-CH3-SW2) where bugs are likely to appear.

### What to test
The quick and dirty summary of [for testing](https://developer.apple.com/library/prerelease/ios/documentation/WindowsViews/Conceptual/AdoptingMultitaskingOniPad/index.html#//apple_ref/doc/uid/TP40015145-CH3-DontLinkElementID_1) is:

- Be mindful of resource consumption. Mo' apps, mo' problems.

<section class="note">To test, “[Try Split View with a] resource-intensive app, such as Maps set to Satellite view and performing a flyover animation."</section>

- Respect the keyboard. Keyboards on secondary apps can mess with your app even if your app doesn't have any use for a keyboard.

<section class="note">To test, Apple advises that "Every iOS 9 developer, even one who makes a full-screen app that never uses a keyboard, might want to respond to the keyboard appearance notifications as described in [UIWindow Class Reference](https://developer.apple.com/library/prerelease/ios/documentation/UIKit/Reference/UIWindow_Class/index.html#//apple_ref/doc/uid/TP40006817)."</section>

- Use Auto Layout and Storyboards. In a multitasking world, users fully control the apps’ bounds.

<section class="note">To test, grab an iPad Air 2 and on it look at each screen of your app at &frac12;, &#8531;, and &frac14; size.</section>

- Does your app project to a secondary screen? Switching between split apps is a new trigger for the old UIScreenDidConnectNotification.

<section class="note">To test, "Test the use case of transitioning from secondary app to primary app."</section>

### ACHTUNG! Multitasking is ON by default
You'll eventually want to support these spiffy new multitasking features. But let's assume you're sane and not ready to hop on the bandwagon.

<section class="note">To opt out, add _UIRequiresFullScreen_ as a key to the _Info.plist_ for the project. Set the value to YES ([source](https://developer.apple.com/library/prerelease/ios/documentation/WindowsViews/Conceptual/AdoptingMultitaskingOniPad/QuickStartForSlideOverAndSplitView.html#//apple_ref/doc/uid/TP40015145-CH13-SW1)).</section>

## Low-power mode
iOS 9 adds low-power mode. Yay! More battery life. Also, more edge cases. The good news is it's easy to test. Turn on low-power mode by [visiting Settings > Battery](https://developer.apple.com/library/prerelease/ios/documentation/Performance/Conceptual/EnergyGuide-iOS/LowPowerMode.html).

The low-power mode changes a few things, which are relevant to testing:

- Reduced CPU and GPU performance
- Pause discretionary and background activities, including networking
- Disable Mail fetch
- Disable motion effects
- Disable animated wallpapers

Any or all of the above might cause strange behavior. Test all the important flows of your app while in low-power mode.

Get designers and PMs involved with the testing. Some of the above might not cause actual bugs but may very well cause unexpected ugliness.

## Keyboard changes
The keyboard has some snazzy new tricks, as well.

- A two-finger tap and hold expands the text field for easy scrolling.
- New system fonts with new spacing.
- Explicit buttons for cut, copy, and paste.

Native apps are likely to be relatively safe from the keyboard changes. Expect Apple's native components to handle the change well.

<section class="note">However, websites receiving a lot of mobile traffic _will_ want to check their free text fields. The new fonts (and associated spacing) are likely to cause visual bugs.</section>

<section class="note">Copy, cut, and paste are nothing new, but the ease of access means bugs around these features are more likely to surface. Take this as a great excuse to test these actions more thoroughly.</section>

## In closing
Download the beta! It's Apple's first public beta, so take advantage. Flip through [the docs](https://developer.apple.com/library/prerelease/ios/documentation/WindowsViews/Conceptual/AdoptingMultitaskingOniPad/index.html#//apple_ref/doc/uid/TP40015145-CH3-DontLinkElementID_1) and get acquainted.

If you're looking to update your cache of test devices, check the [refurb site](http://store.apple.com/us/browse/home/specialdeals/ipad). It's an easy way to save a few bucks.
