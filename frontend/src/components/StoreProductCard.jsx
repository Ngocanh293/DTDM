import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils';
import { extractSpecs } from '../utils/filterUtils';

const getStockLabel = (stock) => {
  if (stock === 0) return { text: 'Het hang', className: 'is-out' };
  if (stock > 0 && stock <= 10) return { text: `Con ${stock}`, className: 'is-low' };
  return { text: 'Con hang', className: 'is-ready' };
};

export default function StoreProductCard({
  product,
  onAddToCart,
  onCompare,
  isCompared = false,
  sectionLabel = 'Gia tot',
}) {
  const specs = extractSpecs(product.name || '', product.categoryName || '');
  const specEntries = Object.entries(specs).filter(([, value]) => value).slice(0, 3);
  const stock = getStockLabel(product.stock);

  const handleAdd = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onAddToCart?.(product);
  };

  const handleCompare = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onCompare?.(product);
  };

  return (
    <Link to={`/products/${product.id}`} className="store-product-card text-decoration-none text-dark h-100">
      <div className="store-card h-100">
        <div className="store-card__badges">
          <span className="store-card__promo">{sectionLabel}</span>
          <span className={`store-card__stock ${stock.className}`}>{stock.text}</span>
        </div>

        <div className="store-card__media">
          <img src={product.imageUrl || '/default-product.png'} alt={product.name} />
        </div>

        <div className="store-card__body">
          <div className="store-card__brand">{product.brand || product.categoryName || 'PCeStore'}</div>
          <h3 className="store-card__title">{product.name}</h3>

          <div className="store-card__specs">
            {specEntries.length > 0 ? (
              specEntries.map(([key, value]) => (
                <span key={`${product.id}-${key}`}>{value}</span>
              ))
            ) : (
              <>
                {product.categoryName && <span>{product.categoryName}</span>}
                {product.brand && <span>{product.brand}</span>}
              </>
            )}
          </div>

          <div className="store-card__price">{formatCurrency(product.price)}</div>
        </div>

        <div className="store-card__actions">
          <button className="store-card__buy" type="button" onClick={handleAdd}>
            <i className="bi bi-cart-plus me-1"></i>Mua ngay
          </button>
          {onCompare && (
            <button
              className={`store-card__compare ${isCompared ? 'is-active' : ''}`}
              type="button"
              onClick={handleCompare}
              aria-label="So sanh san pham"
            >
              <i className="bi bi-arrow-left-right"></i>
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
