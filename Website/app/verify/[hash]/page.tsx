import { redirect } from "next/navigation"

export default async function VerifyHashPage({
  params,
}: {
  params: Promise<{ hash: string }>
}) {
  const { hash } = await params
  redirect(`/verify?hash=${encodeURIComponent(hash)}`)
}
