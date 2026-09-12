export function cameraBounds(mapWidth: number, mapHeight: number, viewWidth: number, viewHeight: number) {
  const extraX = Math.max(0, viewWidth - mapWidth);
  const extraY = Math.max(0, viewHeight - mapHeight);

  return {
    x: extraX === 0 ? 0 : -extraX / 2,
    y: extraY === 0 ? 0 : -extraY / 2,
    width: mapWidth + extraX,
    height: mapHeight + extraY,
  };
}
