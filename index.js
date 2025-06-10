const express = require('express');

const axios = require('axios');

const crypto = require('crypto');

const app = express();

const PORT = process.env.PORT || 6264;

app.use(express.json());

// Nitro API endpoint

app.get('/api/nitro', (req, res) => {

  const nitroCode = crypto.randomBytes(16).toString('hex').toUpperCase();

  res.json({

    code: `NITRO-${nitroCode}`,

    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),

    status: 'active'

  });

});

// Meme API endpoint

app.get('/api/meme', async (req, res) => {

  try {

    const response = await axios.get('https://meme-api.com/gimme');

    res.json({

      title: response.data.title,

      url: response.data.url,

      author: response.data.author,

      subreddit: response.data.subreddit,

      ups: response.data.ups

    });

  } catch (error) {

    // Fallback meme data

    res.json({

      title: "Programming Humor",

      url: "https://i.imgur.com/sample.jpg",

      author: "dev_memer",

      subreddit: "ProgrammerHumor",

      ups: 1337

    });

  }

});

// Pokemon API endpoint

app.get('/api/pokemon', async (req, res) => {

  const { name } = req.query;

  

  if (!name) {

    return res.status(400).json({ error: 'Pokemon name is required' });

  }

  try {

    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);

    const pokemon = response.data;

    

    // Convert stats array to object format

    const statsObj = {};

    pokemon.stats.forEach(stat => {

      statsObj[stat.stat.name] = stat.base_stat;

    });

    res.json({

      abilities: pokemon.abilities.map(ability => ability.ability.name),

      id: pokemon.id,

      name: pokemon.name,

      sprite: pokemon.sprites.front_default,

      stats: statsObj,

      types: pokemon.types.map(type => type.type.name)

    });

  } catch (error) {

    res.status(404).json({ error: 'Pokemon not found' });

  }

});

// URL Shortener API endpoint

app.get('/api/shorten', (req, res) => {

  const { url } = req.query;

  

  if (!url) {

    return res.status(400).json({ error: 'URL is required' });

  }

  // Basic URL validation

  try {

    new URL(url);

  } catch {

    return res.status(400).json({ error: 'Invalid URL format' });

  }

  const shortCode = crypto.randomBytes(4).toString('hex');

  const shortenedUrl = `https://short.ly/${shortCode}`;

  

  res.json({

    original: url,

    shortened: shortenedUrl,

    code: shortCode,

    created: new Date().toISOString()

  });

});

// Password Generator API endpoint

app.get('/api/password', (req, res) => {

  const length = parseInt(req.query.length) || 12;

  const includeUppercase = req.query.uppercase !== 'false';

  const includeLowercase = req.query.lowercase !== 'false';

  const includeNumbers = req.query.numbers !== 'false';

  const includeSymbols = req.query.symbols !== 'false';

  let charset = '';

  if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';

  if (includeNumbers) charset += '0123456789';

  if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (charset === '') {

    return res.status(400).json({ error: 'At least one character type must be enabled' });

  }

  let password = '';

  for (let i = 0; i < length; i++) {

    password += charset.charAt(Math.floor(Math.random() * charset.length));

  }

  // Calculate strength

  let strength = 0;

  if (password.length >= 8) strength += 25;

  if (password.length >= 12) strength += 25;

  if (/[A-Z]/.test(password)) strength += 12.5;

  if (/[a-z]/.test(password)) strength += 12.5;

  if (/[0-9]/.test(password)) strength += 12.5;

  if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;

  const strengthLevel = strength >= 75 ? 'Strong' : strength >= 50 ? 'Medium' : 'Weak';

  res.json({

    password,

    length: password.length,

    strength: {

      score: Math.round(strength),

      level: strengthLevel

    },

    criteria: {

      hasUppercase: /[A-Z]/.test(password),

      hasLowercase: /[a-z]/.test(password),

      hasNumbers: /[0-9]/.test(password),

      hasSymbols: /[^A-Za-z0-9]/.test(password)

    }

  });

});

// GitHub User API endpoint

app.get('/api/github', async (req, res) => {

  const { username } = req.query;

  

  if (!username) {

    return res.status(400).json({ error: 'GitHub username is required' });

  }

  try {

    const [userResponse, reposResponse] = await Promise.all([

      axios.get(`https://api.github.com/users/${username}`),

      axios.get(`https://api.github.com/users/${username}/repos?per_page=100`)

    ]);

    const user = userResponse.data;

    const repos = reposResponse.data;

    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);

    const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);

    const languages = [...new Set(repos.map(repo => repo.language).filter(Boolean))];

    res.json({

      username: user.login,

      name: user.name,

      bio: user.bio,

      location: user.location,

      company: user.company,

      blog: user.blog,

      avatar: user.avatar_url,

      followers: user.followers,

      following: user.following,

      publicRepos: user.public_repos,

      created: user.created_at,

      statistics: {

        totalStars,

        totalForks,

        languages: languages.slice(0, 10),

        mostStarredRepo: repos.sort((a, b) => b.stargazers_count - a.stargazers_count)[0]?.name

      }

    });

  } catch (error) {

    if (error.response?.status === 404) {

      res.status(404).json({ error: 'GitHub user not found' });

    } else {

      res.status(500).json({ error: 'Failed to fetch GitHub data' });

    }

  }

});

// Helper functions for generating random IDs and HWIDs

function generateRandomHwidFluxus(length = 96) {

  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';

  let result = '';

  for (let i = 0; i < length; i++) {

    result += chars.charAt(Math.floor(Math.random() * chars.length));

  }

  return result;

}

function generateRandomHwidArceus(length = 18) {

  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';

  let result = '';

  for (let i = 0; i < length; i++) {

    result += chars.charAt(Math.floor(Math.random() * chars.length));

  }

  return result;

}

function generateRandomIdDelta(length = 64) {

  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';

  let result = '';

  for (let i = 0; i < length; i++) {

    result += chars.charAt(Math.floor(Math.random() * chars.length));

  }

  return result;

}

function generateRandomIdDeltaios(length = 64) {

  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';

  let result = '';

  for (let i = 0; i < length; i++) {

    result += chars.charAt(Math.floor(Math.random() * chars.length));

  }

  return result;

}

function generateRandomIdCryptic(length = 64) {

  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';

  let result = '';

  for (let i = 0; i < length; i++) {

    result += chars.charAt(Math.floor(Math.random() * chars.length));

  }

  return result;

}

function generateRandomIdHydrogen(length = 10) {

  const digits = '0123456789';

  let result = '';

  for (let i = 0; i < length; i++) {

    result += digits.charAt(Math.floor(Math.random() * digits.length));

  }

  return result;

}

function generateRandomHwidVegax() {

  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';

  const parts = [];

  for (let i = 0; i < 5; i++) {

    const partLength = Math.random() < 0.5 ? 8 : 7;

    let part = '';

    for (let j = 0; j < partLength; j++) {

      part += chars.charAt(Math.floor(Math.random() * chars.length));

    }

    parts.push(part);

  }

  return parts.join('-');

}

function generateRandomHwidTrigonevo() {

  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';

  

  function randomString(length) {

    let result = '';

    for (let i = 0; i < length; i++) {

      result += chars.charAt(Math.floor(Math.random() * chars.length));

    }

    return result;

  }

  

  return `${randomString(8)}-${randomString(4)}-${randomString(4)}-${randomString(4)}-${randomString(12)}`;

}

function generateRandomIdCacti(length = 64) {

  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';

  let result = '';

  for (let i = 0; i < length; i++) {

    result += chars.charAt(Math.floor(Math.random() * chars.length));

  }

  return result;

}

function generateRandomHwidEvon() {

  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';

  

  function randomString(length) {

    let result = '';

    for (let i = 0; i < length; i++) {

      result += chars.charAt(Math.floor(Math.random() * chars.length));

    }

    return result;

  }

  

  return `${randomString(8)}-${randomString(4)}-${randomString(4)}-${randomString(4)}-${randomString(12)}`;

}

// Link Generator API endpoint

app.get('/api/gen', (req, res) => {

  const { service } = req.query;

  if (!service) {

    return res.status(400).json({ result: 'Service parameter is required' });

  }

  let result;

  switch (service) {

    case 'fluxus':

      const randomHwidFluxus = generateRandomHwidFluxus();

      result = `https://flux.li/android/external/start.php?HWID=${randomHwidFluxus}`;

      break;

    case 'arceus':

      const randomHwidArceus = generateRandomHwidArceus();

      result = `https://spdmteam.com/key-system-1?hwid=${randomHwidArceus}&zone=Europe/Rome&os=android`;

      break;

    case 'delta':

      const randomIdDelta = generateRandomIdDelta();

      result = `https://gateway.platoboost.com/a/8?id=${randomIdDelta}`;

      break;

    case 'deltaios':

      const randomIdDeltaios = generateRandomIdDeltaios();

      result = `https://gateway.platoboost.com/a/2?id=${randomIdDeltaios}`;

      break;

    case 'cryptic':

      const randomIdCryptic = generateRandomIdCryptic();

      result = `https://gateway.platoboost.com/a/39097?id=${randomIdCryptic}`;

      break;

    case 'hydrogen':

      const randomIdHydrogen = generateRandomIdHydrogen();

      result = `https://gateway.platoboost.com/a/2569?id=${randomIdHydrogen}`;

      break;

    case 'vegax':

      const randomHwidVegax = generateRandomHwidVegax();

      result = `https://pandadevelopment.net/getkey?service=vegax&hwid=${randomHwidVegax}&provider=linkvertise`;

      break;

    case 'trigon':

      const randomHwidTrigon = generateRandomHwidTrigonevo();

      result = `https://trigonevo.fun/whitelist/?HWID=${randomHwidTrigon}`;

      break;

    case 'cacti':

      const randomIdCacti = generateRandomIdCacti();

      result = `https://gateway.platoboost.com/a/23344?id=${randomIdCacti}`;

      break;

    case 'evon':

      const randomHwidEvon = generateRandomHwidEvon();

      result = `https://pandadevelopment.net/getkey?service=evon&hwid=${randomHwidEvon}`;

      break;

    default:

      return res.status(400).json({ result: 'Invalid executor key provided' });

  }

  res.json({ result });

});

// Discord server redirect endpoint

app.get('/server', (req, res) => {

  res.redirect('https://discord.gg/VvWgjhHyQN');

});

// Root endpoint

app.get('/', (req, res) => {

  res.json({

    message: 'API Server is running!',

    endpoints: [

      'GET /api/nitro - Generate Nitro codes',

      'GET /api/meme - Get random memes',

      'GET /api/pokemon?name= - Get Pokemon information',

      'GET /api/shorten?url= - Shorten URLs',

      'GET /api/password - Generate secure passwords',

      'GET /api/github?username= - Get GitHub user info',

      'GET /api/gen?service= - Generate service links',

      'GET /server - Join Discord server'

    ]

  });

});

app.listen(PORT, '0.0.0.0', () => {

  console.log(`API Server running on port ${PORT}`);

  console.log('Available endpoints:');

  console.log('- GET /api/nitro');

  console.log('- GET /api/meme');

  console.log('- GET /api/pokemon?name=pikachu');

  console.log('- GET /api/shorten?url=https://example.com');

  console.log('- GET /api/password');

  console.log('- GET /api/github?username=octocat');

  console.log('- GET /api/gen?service=fluxus');

});

