-- Query para ver um usuário (sem created_at pois não existe na tabela)
SELECT 
    id,
    name,
    email,
    role
FROM users 
LIMIT 1;