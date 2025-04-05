import { PurchasePayment } from "@/components/purchase-payment"

export default function PurchasePaymentPage({ searchParams }: { searchParams: { ensName: string, price: string } }) {
  const ensName = searchParams.ensName
  const price = searchParams.price
  return <PurchasePayment ensName={ensName} price={price} />
}
