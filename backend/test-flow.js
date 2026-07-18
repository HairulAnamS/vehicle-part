const axios = require('axios');
const API = 'http://localhost:5000/api';
let token;
let vehicleId;
let sparepartId;

async function run() {
  try {
    // 1. Login (using test user created earlier)
    let res = await axios.post(`${API}/auth/login`, { email: 'test@test.com', password: 'password' });
    console.log('Login:', res.data.user.email);
    token = res.data.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // 2. Create Vehicle
    res = await axios.post(`${API}/vehicles`, {
      nopol: 'B 1234 ABC',
      type: 'Motor',
      brand: 'Honda',
      model: 'Vario',
      current_km: 10000
    }, config);
    console.log('Vehicle Created:', res.data.nopol);
    vehicleId = res.data.id;

    // 3. Create Sparepart
    res = await axios.post(`${API}/spareparts`, {
      name: 'Oli Mesin',
      replacement_km: 2000
    }, config);
    console.log('Sparepart Created:', res.data.name);
    sparepartId = res.data.id;

    // 4. Get Spareparts (To verify)
    res = await axios.get(`${API}/spareparts`, config);
    console.log('Spareparts List count:', res.data.length);

    // 5. Create Replacement
    res = await axios.post(`${API}/replacements`, {
      vehicle_id: vehicleId,
      sparepart_id: sparepartId,
      km_installed: 10000,
      date_installed: '2023-01-01'
    }, config);
    console.log('Replacement Created:', res.data.km_installed);

    // 6. Update Vehicle KM
    res = await axios.put(`${API}/vehicles/${vehicleId}/km`, { current_km: 12500 }, config);
    console.log('Vehicle KM Updated:', res.data.current_km);

    // 7. Get Reminders
    res = await axios.get(`${API}/reminders`, config);
    console.log('Reminders:', JSON.stringify(res.data, null, 2));

  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}
run();
