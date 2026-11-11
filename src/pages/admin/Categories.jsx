import { useState } from 'react';
import toast from 'react-hot-toast';
import { LuTrash2 } from 'react-icons/lu';
import { ImageField } from './AdminFields';
import { categoryPhoto } from '../../lib/catPhoto';
import { Field, useTitle } from '../../components/ui';
import { deleteCategory, errText, saveCategory } from '../../lib/db';
import { useCatalog } from '../../context/StoreContext';
import { slugify } from '../../config';

const BLANK = { name: '', description: '', icon: 'router', image: '', order: 99, subs: '' };

export default function Categories() {
  useTitle('Categories');
  const { categories, products, reload } = useCatalog();
  const [f, setF] = useState(BLANK);
  const editing = !!f.id;
  const count = (id) => products.filter((p) => p.categoryId === id).length;

  const submit = async (e) => {
    e.preventDefault();
    try {
      const subs = (typeof f.subs === 'string' ? f.subs.split(',') : f.subs).map((s) => s.trim()).filter(Boolean);
      await saveCategory({ ...f, id: f.id || slugify(f.name), slug: slugify(f.name), order: Number(f.order) || 99, subs });
      await reload(); setF(BLANK); toast.success(editing ? 'Category saved' : 'Category added');
    } catch (err) { toast.error(errText(err)); }
  };
  const remove = async (c) => {
    if (count(c.id)) return toast.error(`Move or delete the ${count(c.id)} products in “${c.name}” first.`);
    if (!window.confirm(`Delete “${c.name}”?`)) return;
    try { await deleteCategory(c.id); await reload(); } catch (err) { toast.error(errText(err)); }
  };

  return (
    <div className="admin-page">
      <h1>Categories</h1>
      <div className="admin-grid wide-left">
        <section className="panel">
          <table className="table"><thead><tr><th /><th>Name</th><th>Products</th><th>Order</th><th /></tr></thead><tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td className="t-thumb">{(c.image || categoryPhoto(products, c.id)) && <img src={c.image || categoryPhoto(products, c.id)} alt="" />}</td>
                <td><button className="link" onClick={() => setF({ ...c, subs: (c.subs || []).join(', ') })}><b>{c.name}</b></button><br /><small>{c.description}</small></td>
                <td>{count(c.id)}</td><td>{c.order}</td>
                <td><button className="icon-btn" onClick={() => remove(c)} aria-label={`Delete ${c.name}`}><LuTrash2 /></button></td>
              </tr>
            ))}
          </tbody></table>
        </section>
        <form className="panel" onSubmit={submit}>
          <h2>{editing ? `Edit ${f.name}` : 'Add a category'}</h2>
          <Field label="Name"><input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <Field label="Short description"><input value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
          <Field label="Types inside it" hint="Comma-separated. Used as the Type filter."><input value={f.subs} onChange={(e) => setF({ ...f, subs: e.target.value })} placeholder="PoE switch, Managed switch" /></Field>
          <Field label="Position in menus"><input type="number" value={f.order} onChange={(e) => setF({ ...f, order: e.target.value })} /></Field>
          <ImageField label="Photo on the home page" kind="product" value={f.image || ''} onChange={(image) => setF({ ...f, image })}
            hint="Leave empty to use a photo of a product from this category automatically." />
          <div className="row-gap">
            <button className="btn btn-primary">{editing ? 'Save category' : 'Add category'}</button>
            {editing && <button type="button" className="btn btn-ghost" onClick={() => setF(BLANK)}>Cancel</button>}
          </div>
        </form>
      </div>
    </div>
  );
}
