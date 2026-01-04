import Link from "next/link"

type Props = {
  product: any
  region: any
}

export default function ProductPreview({ product, region }: Props) {
  return (
    <Link
      href={`/products/${product.handle}`}
      className="group block"
    >
      {/* Image */}
      <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100">
        {product.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.thumbnail}
            alt={product.title}

            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-sm text-muted">
            No image
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-4">
        <h3 className="text-base font-medium text-ink">
          {product.title}
        </h3>
        <p className="mt-1 text-sm text-muted">
          Price:   {product.amount}
        </p>
      </div>
    </Link>
  )
}
