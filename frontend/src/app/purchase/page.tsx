import { PurchasePayment } from "@/components/purchase-payment"

export default function PurchasePaymentPage({ searchParams }: { searchParams: { address: string, price: string } }) {
  const address = searchParams.address
  const price = searchParams.price
  return <PurchasePayment address={address} price={price} />
}
