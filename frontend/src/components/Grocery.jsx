import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { knownCategories } from '../categories';
import GroceryItem from './GroceryItem';
import './Grocery.css';

// It is a lot easier to read if you have export default function Grocery() instead of defining your function and then declaring it as the 
// main exportable function of the file. 

// Grocery page: add, adjust quantity, mark purchased, remove.
export default function Grocery() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Produce');
  const [quantity, setQuantity] = useState('1');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setItems(await api.get('/grocery'));
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // You usually know how many you need at the moment you think of the item,
  // so the count is set here rather than stepped up on the row afterwards.
  async function add(e) {
    e.preventDefault();
    if (!name.trim()) return;
    const count = Math.max(1, Math.round(Number(quantity)) || 1);
    await api.post('/grocery', { name, category, quantity: count });
    setName('');
    setQuantity('1');
    load();
  }

  async function update(item, changes) {
    await api.put(`/grocery/${item._id}`, { ...item, ...changes });
    load();
  }

  async function remove(id) {
    await api.del(`/grocery/${id}`);
    load();
  }

  // Categories already on the list join the suggestions, so a custom one is
  // typed once and picked thereafter.
  const categoryOptions = useMemo(() => knownCategories(items), [items]);

  return (
    <section className="grocery-page">
      <h1 className="pp-page-title">Shopping Cart</h1>
      <p className="pp-page-intro">
        What you still need to buy. Tick items off as you shop, then clear them
        once they are home.
      </p>

      <form className="pp-panel row g-2 align-items-end" onSubmit={add}>
        <div className="col">
          <label className="form-label pp-field-label" htmlFor="grocery-name">
            Item
          </label>
          <input
            id="grocery-name"
            className="form-control"
            placeholder="e.g. Milk"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="col-auto">
          <label
            className="form-label pp-field-label"
            htmlFor="grocery-category"
          >
            Category
          </label>
          <input
            id="grocery-category"
            className="form-control"
            list="grocery-category-options"
            placeholder="Pick one or type your own"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <datalist id="grocery-category-options">
            {categoryOptions.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div className="col-auto">
          <label className="form-label pp-field-label" htmlFor="grocery-qty">
            Quantity
          </label>
          <input
            id="grocery-qty"
            className="form-control grocery-add-qty"
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>
        <div className="col-auto">
          <button className="btn btn-success" type="submit">
            Add
          </button>
        </div>
      </form>

      {error && <p className="text-danger">{error}</p>}

      {items.length === 0 ? (
        <p className="pp-empty">
          Your list is empty. Add something you need to buy above.
        </p>
      ) : (
        <ul className="list-group">
          {items.map((item) => (
            <GroceryItem
              key={item._id}
              item={item}
              onUpdate={(changes) => update(item, changes)}
              onDelete={() => remove(item._id)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
