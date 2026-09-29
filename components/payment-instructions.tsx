import { useTranslations } from "next-intl"

import { useFormatCents } from "@/lib/money"
import type { PaymentInstructions as Instructions } from "@/lib/payments/types"

/** How to pay, shown on the order confirmation. One branch per method. */
export function PaymentInstructions({
  instructions,
}: {
  instructions: Instructions
}) {
  switch (instructions.method) {
    case "bank_transfer":
      return <BankTransfer instructions={instructions} />
  }
}

function BankTransfer({ instructions }: { instructions: Instructions }) {
  const t = useTranslations("Confirmation.bankTransfer")
  const formatCents = useFormatCents()

  const rows = [
    { key: "holder", value: instructions.holder },
    { key: "iban", value: formatIban(instructions.iban) },
    { key: "bic", value: instructions.bic },
    { key: "amount", value: formatCents(instructions.amountCents) },
    { key: "reference", value: instructions.reference },
  ] as const

  return (
    <div className="rounded-2xl bg-neutral-100 p-6 sm:p-8 dark:bg-neutral-900">
      <h2 className="text-lg font-medium tracking-tight text-neutral-900 dark:text-white">
        {t("title")}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        {t("body")}
      </p>
      <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-8 gap-y-3 text-sm">
        {rows.map(({ key, value }) => (
          <div key={key} className="contents">
            <dt className="text-neutral-500">{t(key)}</dt>
            <dd className="font-medium break-all text-neutral-900 tabular-nums select-all dark:text-white">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/** "DE89370400440532013000" → "DE89 3704 0044 0532 0130 00" */
function formatIban(iban: string) {
  return iban.replace(/\s+/g, "").replace(/(.{4})(?=.)/g, "$1 ")
}
