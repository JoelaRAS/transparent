import React from 'react';
import { MediaType } from '../../types';

export const createMarkerElement = (type: MediaType, isSelected: boolean) => {
  const container = document.createElement('div');
  container.className = 'custom-neon-marker';
  container.style.width = '24px';
  container.style.height = '24px';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'center';
  container.style.cursor = 'pointer';

  const color = type === 'VIDEO' ? '#00FFB3' : '#00D4FF';
  const glowColor = type === 'VIDEO' ? 'rgba(0,255,179,0.6)' : 'rgba(0,212,255,0.6)';

  const dot = document.createElement('div');
  dot.style.width = isSelected ? '24px' : '16px';
  dot.style.height = isSelected ? '24px' : '16px';
  dot.style.backgroundColor = color;
  dot.style.borderRadius = '50%';
  dot.style.boxShadow = `0 0 ${isSelected ? '20px' : '10px'} ${glowColor}`;
  dot.style.border = '2px solid #0A0F14';
  dot.style.transition = 'all 0.3s ease';

  container.appendChild(dot);

  if (type === 'VIDEO') {
    const playIcon = document.createElement('div');
    playIcon.style.position = 'absolute';
    playIcon.style.width = '0';
    playIcon.style.height = '0';
    playIcon.style.borderTop = '3px solid transparent';
    playIcon.style.borderBottom = '3px solid transparent';
    playIcon.style.borderLeft = '5px solid #0A0F14';
    container.appendChild(playIcon);
  }

  return container;
};
