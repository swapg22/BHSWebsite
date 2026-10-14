/**
 * Page-enter transition: each navigation re-mounts this template, so the new page rises in
 * while a thin band of marigold light sweeps across the top. Stops for reduced-motion users.
 */
export default function FrontendTemplate({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="page-sweep" aria-hidden="true" />
      <div className="page-enter">{children}</div>
    </>
  )
}
