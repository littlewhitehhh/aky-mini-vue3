export function shouldUpdateComponent(preVnode, nextVnode) {
  const { props: prevProps } = preVnode;
  const { props: nextProps } = nextVnode;
  for (const key in nextProps) {
    if (nextProps[key] !== prevProps[key]) {
      return true;
    }
  }
  return false;
}
