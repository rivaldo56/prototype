const smooth = (value: number): number => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};

/** Dock the travelling record in the collection's actual centre slot. */
export function collectionPose(element: HTMLElement, progress: number, x: number, y: number, size: number, turn: number, tilt: number) {
  const stage = element.parentElement;
  const inCollection = progress > 1.4 && progress < 3;
  if (stage) stage.dataset.recordInCollection = String(inCollection);
  const frame = inCollection ? stage?.querySelector<HTMLElement>('.journey-crate-carousel [tabindex]') : null;
  const card = frame?.querySelector<HTMLElement>('[role="group"]');
  if (!frame || !card) return { x, y, size, turn, tilt };

  const bounds = element.getBoundingClientRect();
  const slot = frame.getBoundingClientRect();
  const cardSize = card.offsetWidth;
  const slotX = slot.left + slot.width / 2 - bounds.left - bounds.width / 2;
  const slotY = slot.top + parseFloat(getComputedStyle(frame).paddingTop) + cardSize / 2 - bounds.top - bounds.height / 2;
  const join = smooth((progress - 1.4) / .55);
  const leave = smooth((progress - 2.5) / .5);
  const weight = join * (1 - leave);
  const downward = bounds.height * .6 * smooth((progress - 2.2) / .5);
  return {
    x: x + (slotX - x) * weight,
    y: y + (slotY + downward - y) * weight,
    size: size + (cardSize - size) * weight,
    turn: turn + (360 - turn) * weight,
    tilt: tilt * (1 - weight),
  };
}
