FROM node:22-bookworm

RUN apt-get update && apt-get install -y \
  libnspr4 \
  libnss3 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdrm2 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libgbm1 \
  libgtk-3-0 \
  libpango-1.0-0 \
  libcairo2 \
  libasound2 \
  fonts-noto-cjk \
  fonts-noto-color-emoji \
  ffmpeg \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

CMD ["bash"]
