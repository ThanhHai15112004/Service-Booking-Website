import { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter signup:', email);
    // Handle newsletter signup logic here
    setEmail('');
  };

  return (
    <div className="container mx-auto px-4 pb-16">
      <div className="bg-black text-white rounded-2xl p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Đăng ký nhận ưu đãi đặc biệt</h2>
        <p className="text-gray-300 mb-6">
          Nhận ngay mã giảm giá 10% cho lần đặt phòng đầu tiên
        </p>
        <form onSubmit={handleSubmit} className="max-w-md mx-auto flex gap-4">
          <input
            type="email"
            placeholder="Nhập email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg text-gray-900"
            required
          />
          <button 
            type="submit"
            className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition"
          >
            Đăng ký
          </button>
        </form>
      </div>
    </div>
  );
}