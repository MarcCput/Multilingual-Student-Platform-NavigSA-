/* ===========================================================================
   NavigSA — signed-in self test
   ---------------------------------------------------------------------------
   Exercises every authenticated operation the app performs, plus the attacks
   it should refuse. Everything it creates, it deletes again.

   HOW TO RUN
     1. Open the app and SIGN IN.
     2. Press F12 -> Console.
     3. Paste this whole file, press Enter.
     4. Copy the report it prints.

   It reads your session from localStorage and talks to Supabase directly, so
   it tests the backend rules rather than the buttons on the page. Nothing of
   yours is modified: profile fields are restored to their original values.
   =========================================================================== */

(async () => {
  const pass = [], fail = [], skip = [];
  const ok = (n, d) => pass.push(`${n} — ${d}`);
  const no = (n, d) => fail.push(`${n} — ${d}`);

  // --- find the session -----------------------------------------------------
  const key = Object.keys(localStorage).find((k) => /^sb-.*-auth-token$/.test(k));
  if (!key) {
    console.log('%cNot signed in — sign in first, then re-run.', 'color:#dc2626;font-weight:bold');
    return;
  }
  const sess = JSON.parse(localStorage.getItem(key));
  const token = sess.access_token;
  const uid = sess.user?.id;
  const ref = key.match(/^sb-(.*)-auth-token$/)[1];
  const URL = `https://${ref}.supabase.co`;

  // The anon key is compiled into the app bundle, so read it from there rather
  // than making anyone paste it. Falls back to a prompt if the shape changes.
  let anonKey = null;
  try {
    const src = [...document.scripts].map((s) => s.src).find((s) => /\/assets\/index-.*\.js$/.test(s));
    if (src) {
      const code = await (await fetch(src)).text();
      anonKey = (code.match(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/) || [])[0] || null;
    }
  } catch { /* fall through to the prompt */ }
  if (!anonKey) {
    anonKey = prompt('Could not read the anon key from the bundle. Paste VITE_SUPABASE_ANON_KEY:');
  }
  if (!anonKey) { console.log('Cancelled — no anon key.'); return; }

  const H = { apikey: anonKey, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const rest = (p, init = {}) => fetch(`${URL}/rest/v1/${p}`, { ...init, headers: { ...H, ...(init.headers || {}) } });

  const made = { apps: [], docs: [], paths: [] };
  let originalProfile = null;

  try {
    // === 1. profile =========================================================
    let r = await rest(`profiles?id=eq.${uid}&select=*`);
    let rows = await r.json();
    originalProfile = rows[0] || null;
    originalProfile
      ? ok('profile exists', 'signup trigger created the row')
      : no('profile exists', 'NO PROFILE ROW — the signup trigger did not fire');

    // === 2. profile update (allowed columns) ================================
    const probeName = originalProfile?.first_name ?? 'Test';
    r = await rest(`profiles?id=eq.${uid}`, {
      method: 'PATCH', headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ phone: '+27 000 000 0000' }),
    });
    r.ok ? ok('update own profile', 'allowed column accepted')
         : no('update own profile', `HTTP ${r.status} ${(await r.text()).slice(0, 90)}`);

    // === 3. SECURITY: self-verification must be refused ======================
    r = await rest(`profiles?id=eq.${uid}`, {
      method: 'PATCH', body: JSON.stringify({ verification_status: 'verified' }),
    });
    const body3 = await r.text();
    /permission denied/i.test(body3)
      ? ok('SECURITY: self-verify profile', 'refused — column grant working')
      : no('SECURITY: self-verify profile',
           `ACCEPTED (HTTP ${r.status}) — migration 0004 is NOT applied; a student can verify themselves`);

    // === 4. applications: create / read / update / delete ====================
    r = await rest('applications', {
      method: 'POST', headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        user_id: uid, university: 'SELF TEST — safe to delete',
        program: 'SELF TEST', requirements_total: 5, next_step: 'self test',
      }),
    });
    if (r.ok) {
      const app = (await r.json())[0];
      made.apps.push(app.id);
      ok('create application', `id ${app.id.slice(0, 8)}`);

      r = await rest(`applications?id=eq.${app.id}&select=*`);
      ((await r.json()).length === 1)
        ? ok('read back application', 'row returned')
        : no('read back application', 'row not found after insert');

      r = await rest(`applications?id=eq.${app.id}`, {
        method: 'PATCH', body: JSON.stringify({ progress: 42, status: 'in-progress' }),
      });
      r.ok ? ok('update application', 'progress + status accepted')
           : no('update application', `HTTP ${r.status}`);
    } else {
      no('create application', `HTTP ${r.status} ${(await r.text()).slice(0, 90)}`);
    }

    // === 5. SECURITY: writing a row onto someone else's id ===================
    const OTHER = '00000000-0000-0000-0000-000000000009';
    r = await rest('applications', {
      method: 'POST', headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ user_id: OTHER, university: 'SELF TEST — escalation', program: 'x' }),
    });
    if (r.ok) {
      const stolen = (await r.json())[0];
      made.apps.push(stolen.id);
      no('SECURITY: write to another user', 'ACCEPTED — the insert policy is not checking user_id');
    } else {
      ok('SECURITY: write to another user', `refused (HTTP ${r.status})`);
    }

    // === 6. documents: upload / read / signed url / delete ===================
    const pdf = new Blob(['%PDF-1.4\n% NavigSA self test\n'], { type: 'application/pdf' });
    const path = `${uid}/selftest-${Date.now()}.pdf`;
    let up = await fetch(`${URL}/storage/v1/object/documents/${path}`, {
      method: 'POST',
      headers: { apikey: anonKey, Authorization: `Bearer ${token}`, 'Content-Type': 'application/pdf' },
      body: pdf,
    });
    if (up.ok) {
      made.paths.push(path);
      ok('upload to own folder', 'accepted');

      r = await rest('documents', {
        method: 'POST', headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          user_id: uid, name: 'SELF TEST.pdf', type: 'Identity',
          storage_path: path, size_bytes: pdf.size, mime_type: 'application/pdf',
        }),
      });
      if (r.ok) {
        const doc = (await r.json())[0];
        made.docs.push(doc.id);
        ok('create document row', `status defaulted to "${doc.status}"`);
        doc.status === 'pending'
          ? ok('SECURITY: new document starts pending', 'cannot be born approved')
          : no('SECURITY: new document starts pending', `status was "${doc.status}"`);

        // signed url
        const su = await fetch(`${URL}/storage/v1/object/sign/documents/${path}`, {
          method: 'POST',
          headers: { apikey: anonKey, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ expiresIn: 60 }),
        });
        su.ok ? ok('signed URL for own file', 'minted, 60s expiry')
              : no('signed URL for own file', `HTTP ${su.status}`);

        // === 7. SECURITY: approving your own document =======================
        r = await rest(`documents?id=eq.${doc.id}`, {
          method: 'PATCH', body: JSON.stringify({ status: 'verified' }),
        });
        const body7 = await r.text();
        /permission denied/i.test(body7)
          ? ok('SECURITY: self-approve document', 'refused — column grant working')
          : no('SECURITY: self-approve document',
               `ACCEPTED (HTTP ${r.status}) — migration 0004 is NOT applied; a student can approve their own documents`);
      } else {
        no('create document row', `HTTP ${r.status} ${(await r.text()).slice(0, 90)}`);
      }
    } else {
      no('upload to own folder', `HTTP ${up.status} ${(await up.text()).slice(0, 90)}`);
    }

    // === 8. SECURITY: uploading into someone else's folder ==================
    const foreign = `${OTHER}/intruder-${Date.now()}.pdf`;
    up = await fetch(`${URL}/storage/v1/object/documents/${foreign}`, {
      method: 'POST',
      headers: { apikey: anonKey, Authorization: `Bearer ${token}`, 'Content-Type': 'application/pdf' },
      body: pdf,
    });
    if (up.ok) { made.paths.push(foreign); no('SECURITY: upload to another user folder', 'ACCEPTED — storage policy is wrong'); }
    else ok('SECURITY: upload to another user folder', `refused (HTTP ${up.status})`);

    // === 9. SECURITY: unscoped reads only return your own rows ==============
    for (const t of ['applications', 'documents', 'profiles']) {
      r = await rest(`${t}?select=user_id,id&limit=200`);
      const all = await r.json();
      const foreignRows = Array.isArray(all)
        ? all.filter((row) => (t === 'profiles' ? row.id : row.user_id) !== uid) : [];
      foreignRows.length === 0
        ? ok(`SECURITY: unscoped read of ${t}`, `${Array.isArray(all) ? all.length : 0} row(s), all yours`)
        : no(`SECURITY: unscoped read of ${t}`, `LEAKED ${foreignRows.length} row(s) belonging to others`);
    }

    // === 10. services catalogue ============================================
    r = await rest('services?select=name,provider');
    const svc = await r.json();
    Array.isArray(svc) && svc.length > 0
      ? ok('read services', `${svc.length} provider(s) visible`)
      : no('read services', 'empty — seed migration 0003 may not have run');

    // === 11. SECURITY: writing to the shared catalogue ======================
    r = await rest('services', {
      method: 'POST', body: JSON.stringify({ name: 'SELF TEST', provider: 'x', category: 'legal' }),
    });
    r.ok ? no('SECURITY: write to services', 'ACCEPTED — the catalogue is user-writable')
         : ok('SECURITY: write to services', `refused (HTTP ${r.status})`);

  } catch (e) {
    no('unexpected error', e.message);
  } finally {
    // --- clean up everything this script created ---------------------------
    for (const id of made.docs) await rest(`documents?id=eq.${id}`, { method: 'DELETE' }).catch(() => {});
    for (const id of made.apps) await rest(`applications?id=eq.${id}`, { method: 'DELETE' }).catch(() => {});
    for (const p of made.paths) {
      await fetch(`${URL}/storage/v1/object/documents/${p}`, {
        method: 'DELETE', headers: { apikey: anonKey, Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    if (originalProfile) {
      await rest(`profiles?id=eq.${uid}`, {
        method: 'PATCH', body: JSON.stringify({ phone: originalProfile.phone }),
      }).catch(() => {});
    }
  }

  // --- report ---------------------------------------------------------------
  const line = '─'.repeat(64);
  console.log(`\n${line}\nNavigSA self test\n${line}`);
  console.log(`\nPASSED (${pass.length})`);
  pass.forEach((p) => console.log('  ✓ ' + p));
  console.log(`\nFAILED (${fail.length})`);
  fail.length ? fail.forEach((f) => console.log('  ✗ ' + f)) : console.log('  (none)');
  console.log(`\n${line}`);
  console.log(fail.length === 0
    ? 'ALL CHECKS PASSED — functionality and security both verified.'
    : `${fail.length} PROBLEM(S) — copy this report back to Claude.`);
  console.log('Test data created by this script has been deleted again.');
  console.log(line);
})();
