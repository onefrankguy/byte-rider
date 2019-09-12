# Byte Rider #

> "What do you call an eight bit jockey? ... A byte rider."

Byte Rider is a two player card game, you against an AI. On your turn you may
take one action...

1. Draw a card and add it to your hand.
2. Play a point card and score its value.
3. Discard a point card to trigger an effect.
4. Play a non-point card to trigger a permanent effect.
5. Play a point card on an equal or lower value point card. Discard both cards.

...then it's the AI's turn. The first to reach 21 points wins.

Byte Rider was built for [js13kGames 2019][js13k].

## Inspiration ##

Byte Rider is a digital version of [Cuttle][], a combat card game from the
1970s. I started with a set of [rule revisiosns][bgg] by Brian Wirsing, and
tweaked them until I had something that worked for touch screens and AI.

## Graphics ##

The background graphic and logo design are from [Playing w/ Retro Typography][mk]
by Max Kohler. The board graphic is a recolor of [HoneyComb][hex] by Paul
Salentiny. The color scheme was built with the help of [Coloring for Colorblindness][color]
by David Nichols.

### Icons ###

Icons for the cards are from [game-icons.net][gin] by various artists. They are
all licensed under a [CC BY 3.0][cc3] license. Links below are to the originals.

* [walking-turret][]
* [skull-with-syringe][]
* [companion-cube][]
* [digital-trace][]
* [usb-key][]
* [family-tree][]
* [load][]
* [cyborg-face][]
* [heart-bottle][]
* [death-note][]
* [trojan-horse][]
* [skull-shield][]
* [cpu][]
* [stack][]
* [card-play][]
* [card-draw][]
* [card-burn][]

## Development ##

[Node][] versions are managed via [NVM][]. The `start` script will launch a
development server on 127.0.0.1:3000.

```bash
nvm install
npm run start
```

The `build` script will package the project.

```bash
nvm install
npm run build
```

## License ##

All code is licensed under a MIT license. See the LICENSE file for more details.
Most graphics are licensed under some form of Creative Commons license. See the
"Graphics" section of this README for more details. The game and text are
licensed under a [Creative Commons Attribution 4.0 International License][cc4].


[js13k]: https://2019.js13kgames.com/ "Andrzej Mazur (js13kGames): HTML5 and JavaScript game development competition in just 13 kB"
[Cuttle]: https://www.pagat.com/combat/cuttle.html "John McLeod (Pagat): Cuttle"
[bgg]: https://boardgamegeek.com/thread/1351248/beamer159s-rule-revisions "Brian Wirsing (Board Game Geek): Beamer159's Rule Revisions"
[mk]: https://codepen.io/maxakohler/pen/zacsg "Max Kohler (CodePen): Playing w/ Retro Typography"
[hex]: http://lea.verou.me/css3patterns/#honeycomb "Paul Salentiny (CSS3 Patterns Gallery): HoneyComb"
[color]: https://davidmathlogic.com/colorblind/#%23005AB5-%23DC3220-%23FFB000 "David Nichols: Colring for Colorblindness"
[gin]: https://game-icons.net "Various (game-icons.net): 3614 free SVG and PNG icons for your games and apps"
[cc3]: https://creativecommons.org/licenses/by/3.0/ "Creative Commons Attribution 3.0 Unported"
[Node]: https://nodejs.org/ "Various (Node.js Foundation): Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine"
[NVM]: https://github.com/nvm-sh/nvm "Various (GitHub): Node Version Manager"
[walking-turret]: https://game-icons.net/1x1/delapouite/walking-turret.html "Delapouite (game-icons.net): An automatic sentry tower that can move along short distances."
[skull-with-syringe]: https://game-icons.net/1x1/zajkonur/skull-with-syringe.html "Zajkonur (game-icons.net): This cranium has the cure between its teeth."
[companion-cube]: https://game-icons.net/1x1/delapouite/companion-cube.html "Delapouite (game-icons.net): The ultimate empathy test when Shell is about to destroy it in Portal following the orders of Glados."
[digital-trace]: https://game-icons.net/1x1/spencerdub/digital-trace.html "SpencerDub (game-icons.net): Coordinate pinpoint indicating a precise location on a map."
[usb-key]: https://game-icons.net/1x1/delapouite/usb-key.html "Delapouite (game-icons.net): External memory stick to store important data if you manage to plug in the right way on the first try."
[family-tree]: https://game-icons.net/1x1/delapouite/family-tree.html "Delapouite (game-icons.net): A network of people, connecting parents and children. Like the brackets of a championship."
[load]: https://game-icons.net/1x1/delapouite/load.html "Delapouite (game-icons.net): Loading data from a floppy disk."
[cyborg-face]: https://game-icons.net/1x1/delapouite/cyborg-face.html "Delapouite (game-icons.net): A emotionless humanoid with some robotic enhancements: an antenna forehead and extra vision."
[heart-bottle]: https://game-icons.net/1x1/lorc/heart-bottle.html "Lorc (game-icons.net): Transparent container with floating life inside to restore health points."
[death-note]: https://game-icons.net/1x1/lorc/death-note.html "Lorc (game-icons.net): A bad omen written on a paper. The reader will be doomed just by skimming through the pages of this cursed book."
[trojan-horse]: https://game-icons.net/1x1/delapouite/trojan-horse.html "Delapouite (game-icons.net): Huge wooden decoy used by the Greeks to capture the city of Troy."
[skull-shield]: https://game-icons.net/1x1/lorc/skull-shield.html "Lorc (game-icons.net): A pugnacious cranium as emblem."
[cpu]: https://game-icons.net/1x1/delapouite/cpu.html "Delapouite (game-icons.net): The heart of a computer, juggling with bits to process data."
[stack]: https://game-icons.net/1x1/delapouite/stack.html "Delapouite (game-icons.net): Pile of cards on top of each others, in layers."
[card-play]: https://game-icons.net/1x1/quoting/card-play.html "Quoting (game-icons.net): One of the cards in your hand will have a big impact on the game: choose carefully the one needed."
[card-draw]: https://game-icons.net/1x1/faithtoken/card-draw.html "Faithtoken (game-icons.net): Grab the card on top of the stack."
[card-burn]: https://game-icons.net/1x1/delapouite/card-burn.html "Delapouite (game-icons.net): This card should be discarded from the stack. No players will be able to use it."
[cc4]: https://creativecommons.org/licenses/by/4.0/ "Creative Commons Attribution 4.0 International"
