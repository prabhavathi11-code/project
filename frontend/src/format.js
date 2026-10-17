/**
 * Format helper for converting cart item prices from string to number and keeping row ID and listing ID separate.
 */
export const formatCartItem = item => ({
  id: item.id, // The row's own ID in the cart table
  listingId: item.listing, // The listing's ID
  title: item.listing_title,
  condition: item.listing_condition,
  price: Number(item.listing_price || 0), // Turned into a number once
  imageUrl: item.listing_imageUrl || 'https://picsum.photos/seed/listing/300/300',
  hostel: item.listing_hostel || '',
  quantity: Number(item.quantity || 1)
})

export const formatCurrency = amount => {
  const num = typeof amount === 'number' ? amount : Number(amount || 0)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(num)
}
