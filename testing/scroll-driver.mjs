// The shared alignment contract measures the visible editor surface, which can
// differ from the native input target in composite toolkits.
export function textSurface(input) {
  return input
}

export function textFocus(input) {
  return { target: input, kind: 'outline' }
}
