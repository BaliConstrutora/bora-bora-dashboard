A categoria "Terraplaagem" existe na tabela `categorias_personalizadas` do banco (id: `798a4bcb-58ba-4de7-9658-de5bd8e51906`). Não há itens da planilha nem serviços extraídos atualmente vinculados a essa categoria, então a correção é apenas renomear o registro.

### Plano
1. **Atualizar o registro no banco** — executar `UPDATE categorias_personalizadas SET nome = 'Terraplanagem' WHERE id = '798a4bcb-58ba-4de7-9658-de5bd8e51906'`.
2. **Verificar** — confirmar que o nome foi atualizado e que não há outros registros com a grafia antiga.

Nenhuma alteração de código é necessária, pois a lista de categorias personalizadas é carregada dinamicamente do banco.