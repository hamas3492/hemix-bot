import { Command } from '../../types/command';
import { getTargetName } from '../../utils/media';

const AVENGERS = [
  {
    hero: 'Iron Man (Tony Stark)',
    power: 'Genius-level intellect & Nano-tech Armor',
    weapon: 'Mark 85 Arc Reactor & Repulsors',
    quote: 'I am Iron Man. 3000!',
  },
  {
    hero: 'Captain America (Steve Rogers)',
    power: 'Super-Soldier serum & Tactical leadership',
    weapon: 'Vibranium Shield & Mjolnir',
    quote: 'I can do this all day.',
  },
  {
    hero: 'Thor Odinson',
    power: 'God of Thunder & Asgardian immortality',
    weapon: 'Stormbreaker & Mjolnir',
    quote: 'Bring me Thanos!',
  },
  {
    hero: 'The Incredible Hulk (Bruce Banner)',
    power: 'Infinite gamma rage strength',
    weapon: 'Gamma Fists',
    quote: 'HULK SMASH!',
  },
  {
    hero: 'Spider-Man (Peter Parker)',
    power: 'Spider-Sense, Agility & Web Shooters',
    weapon: 'Iron Spider Suit',
    quote: 'With great power comes great responsibility.',
  },
  {
    hero: 'Doctor Strange (Stephen Strange)',
    power: 'Master of Mystic Arts & Time Manipulation',
    weapon: 'Eye of Agamotto & Cloak of Levitation',
    quote: 'We are in the Endgame now.',
  },
  {
    hero: 'Black Widow (Natasha Romanoff)',
    power: 'Master spy & Martial arts expert',
    weapon: 'Widow Stings & Batons',
    quote: 'Whatever it takes.',
  },
  {
    hero: 'Thanos (The Mad Titan)',
    power: 'Cosmic scale strength & Reality warping',
    weapon: 'Infinity Gauntlet (6 Stones)',
    quote: 'I am inevitable.',
  },
];

const command: Command = {
  name: 'avengers',
  alias: ['avenger', 'marvel'],
  category: 'Fun',
  description: 'Find out which Avengers superhero or villain matches you',
  usage: '.avengers [name]',
  permission: 1,
  cooldown: 3,
  handler: async (ctx) => {
    const name = getTargetName(ctx);

    // Pick deterministic or random hero based on string length or random
    const randIndex = Math.abs(
      name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + Math.floor(Math.random() * 3)
    ) % AVENGERS.length;

    const hero = AVENGERS[randIndex];
    const powerLevel = Math.floor(Math.random() * 20) + 81; // 81-100%

    const response =
      `🛡️ *AVENGERS HERO ASSIGNMENT* ⚡\n\n` +
      `👤 *Agent:* ${name}\n` +
      `🦸 *Assigned Hero:* ${hero.hero}\n` +
      `⚡ *Power Level:* ${powerLevel}%\n` +
      `⚔️ *Primary Weapon:* ${hero.weapon}\n` +
      `✨ *Special Ability:* ${hero.power}\n` +
      `💬 *Iconic Quote:* "${hero.quote}"\n\n` +
      `*AVENGERS ASSEMBLE!* 💥`;

    await ctx.reply(response);
  },
};

export default command;
