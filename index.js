const express = require('express');
const app = express();
const path = require('path');
const axios = require('axios');
const sharp = require('sharp');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.redirect('/info');
});

app.get('/info', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/avatar/:username', async (req, res) => {
  try {
    const username = req.params.username;
    const isBedrock = username.startsWith('.');
    if (isBedrock) {
      try {
        const bedrockUsername = username.substring(1);
        const xuidResponse = await axios.get(`https://api.geysermc.org/v2/xbox/xuid/${bedrockUsername}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        });
        const xuid = xuidResponse.data.xuid;
        const skinResponse = await axios.get(`https://api.geysermc.org/v2/skin/${xuid}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        });
        const textureData = skinResponse.data;
        if (textureData && textureData.texture_id) {
          const textureResponse = await axios.get(`https://textures.minecraft.net/texture/${textureData.texture_id}`, {
            responseType: 'arraybuffer',
            headers: {
              'User-Agent': 'Mozilla/5.0'
            }
          });
          const face = await sharp(textureResponse.data)
            .extract({ left: 8, top: 8, width: 8, height: 8 })
            .resize(64, 64, {
              kernel: sharp.kernel.nearest,
              fit: 'fill',
              withoutEnlargement: false
            })
            .png({ quality: 100 })
            .toBuffer();
          res.set('Content-Type', 'image/png');
          res.set('Cache-Control', 'public, max-age=86400');
          res.send(face);
          return;
        }
      } catch (bedrockError) {
        console.error('Bedrock skin processing error:', bedrockError.message);
      }
    } else {
      try {
        const response = await axios.get(`https://minotar.net/avatar/${username}/64`, {
          responseType: 'arraybuffer',
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        });
        res.set('Content-Type', 'image/png');
        res.set('Cache-Control', 'public, max-age=86400');
        res.send(response.data);
        return;
      } catch (javaError) {
        console.error('Java skin processing error:', javaError.message);
      }
    }
    throw new Error('Could not retrieve avatar');
  } catch (error) {
    try {
      const defaultAvatar = await sharp(path.join(__dirname, 'public', 'default-avatar.jpeg'))
        .resize(64, 64, {
          kernel: sharp.kernel.nearest,
          fit: 'fill',
          withoutEnlargement: false
        })
        .png({ quality: 100 })
        .toBuffer();
      res.set('Content-Type', 'image/png');
      res.send(defaultAvatar);
    } catch (err) {
      res.status(500).send('Error loading avatar');
    }
  }
});

app.get('/notfound', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', '404.html'));
});

app.use((req, res) => {
  res.redirect('/notfound');
});

module.exports = app;
