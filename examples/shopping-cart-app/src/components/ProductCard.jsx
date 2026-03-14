import {useCartStore} from '../store/cart.store';

export const ProductCard = ({siero_name,siero_price,siero_category,siero_desktop_url,siero_tablet_url,siero_mobile_url,siero_thumbnail_url}) => {
  const {addItemToCart,removeItemFromCart, updateItemInCart, cartItems} = useCartStore();

  let quantity = 0;
  const itemsInCart = cartItems.filter(item => item.name === name);
  if (itemsInCart.length > 0) {
    quantity = itemsInCart[0].quantity;
  }

  

  const addOne = () => {
    const newQuantity = quantity + 1;
    //setQuantity(newQuantity);
    if (newQuantity === 1) {
      addItemToCart(
        {
          siero_name,
          siero_price,
          quantity: newQuantity,
          siero_desktop_url,
          siero_tablet_url,
          siero_mobile_url,
          siero_thumbnail_url
        }
      )
    } else {
        updateItemInCart({
          siero_name,
          siero_price,
          quantity: newQuantity,
          siero_desktop_url,
          siero_tablet_url,
          siero_mobile_url,
          siero_thumbnail_url
        });
    }
  }

  const substractOne = () => {
    const newQuantity = quantity - 1
    //setQuantity(newQuantity);
    if (newQuantity === 0) {
      removeItemFromCart(name);
    } else {
      updateItemInCart({
        siero_name,
        siero_price,
        quantity: newQuantity,
        siero_desktop_url,
        siero_tablet_url,
        siero_mobile_url,
        siero_thumbnail_url
      });
    }
  }

  return (
    <div className="relative">
      <picture>
        <source media="(min-width: 768px)" srcSet={siero_tablet_url}/>
        <source media="(min-width: 1440px)" srcSet={siero_desktop_url}/>
        <img 
          className="rounded-lg mb-[38px]"
          src={siero_mobile_url}
          alt={name} />
      </picture>
      {quantity === 0 ? (
        <button onClick={addOne} className="bg-Rose-50 border-2 border-Rose-300 w-40 rounded-full 
      flex justify-center gap-2 p-3 absolute top-[190px] md:top-[295px] xl:top-[225px] inset-x-0 mx-auto cursor-pointer
       hover:border-Red transition-colors">
        <img src="/assets/images/icon-add-to-cart.svg" alt="icon-add-to-cart" />
        <span>Add to cart</span>
      </button>
      ):(<div className="bg-Red w-40 rounded-full 
      flex justify-between items-center gap-2 p-3 absolute top-[190px] md:top-[295px] xl:top-[225px] inset-x-0 mx-auto cursor-pointer
       hover:border-Red transition-colors">
        <img 
          onClick={substractOne}
          className="border border-Rose-50 size-[18px] rounded-full p-1 hover:bg-Rose-50 transition-color delay-100"
          src="/assets/images/icon-decrement-quantity.svg"
          alt="icon-decrement-quantity" />
        <p className="text-Rose-50">{quantity}</p>
        <img 
          onClick={addOne}
          className="border border-Rose-50 size-[18px] rounded-full p-1 hover:bg-Rose-50 transition-color delay-100"
          src="/assets/images/icon-increment-quantity.svg"
          alt="icon-increment-quantity" />
      </div>)}
      

      <p className="text-Rose-500 text-sm">{siero_category}</p>
      <h2 className="font-bold">{name}</h2>
      <p className="text-Red font-semibold">${siero_price}</p>
    </div>
  )
}
