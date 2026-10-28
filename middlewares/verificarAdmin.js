// Solo los usuarios cuyo perfil tiene rol 'admin' pueden entrar al panel.
const supabase = require('../config/supabaseClient');

async function verificarAdmin(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('perfiles')
      .select('rol')
      .eq('id', req.usuario.id)
      .maybeSingle();

    if (error) return res.status(500).send('No se pudo verificar el rol');
    if (!data || data.rol !== 'admin') {
      return res.status(403).send('No tenés permiso para acceder al panel admin');
    }

    req.usuario.rol = data.rol;
    next();
  } catch (error) {
    res.status(500).send('No se pudo verificar el rol');
  }
}

module.exports = verificarAdmin;
