class Pedido {
    constructor(cliente, dataPedido, status, listaItens) {
        this.idPessoa = idPessoa;
        this.dataPedido = dataPedido;
        this.status = status;
        this.listaItens = listaItens;
        this.dataPedido = new Date();
        this.formaPgto = formaPgto;
        this.parcelas = parcelas;
    }


    async registrarPedido() {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const subtotal = this.itens.reduce((sum, item) => sum + (item.quantidade * item.precoUnitario), 0);
            const queryPedido = `
                INSERT INTO tb_pedido (
                    ID_PRODUTO_FK, 
                    ID_PESSOA_FK, 
                    QUANTIDADE, 
                    SUBTOTAL, 
                    FORMA_PGTO, 
                    PARCELAS, 
                    VENCIMENTO, 
                    TOTAL
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

            const produtoPrincipal = this.itens[0];

            const vencimento = new Date();
            vencimento.setDate(vencimento.getDate() + 7);

            const [resultPedido] = await connection.execute(queryPedido, [
                produtoPrincipal.idProduto,
                this.idPessoa,
                produtoPrincipal.quantidade,
                subtotal,
                this.formaPgto,
                this.parcelas,
                vencimento.toISOString().split('T')[0],
                total
            ]);

            const idPedido = resultPedido.insertId;

            const queryHistorico = `
                INSERT INTO tb_hist_pedido (
                    ID_PEDIDO_FK,
                    DATA,
                    STATUS
                ) VALUES (?, ?, ?)`;

            await connection.execute(queryHistorico, [
                idPedido,
                new Date().toISOString().split('T')[0],
                this.status
            ]);

            await connection.commit();
            console.log(`Pedido ${idPedido} registrado com sucesso!`);
            return idPedido;

        } catch (err) {
            await connection.rollback();
            console.error('Erro ao registrar pedido:', err);
            throw err;
        } finally {
            connection.release();
        }
    }

    async atualizarStatus(idPedido, novoStatus) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            this.status = novoStatus;

            const query = `
                INSERT INTO tb_hist_pedido (
                    ID_PEDIDO_FK,
                    DATA,
                    STATUS
                ) VALUES (?, ?, ?)`;

            await connection.execute(query, [
                idPedido,
                new Date().toISOString().split('T')[0],
                novoStatus
            ]);

            await connection.commit();
            console.log(`Status do pedido ${idPedido} atualizado para: ${novoStatus}`);
            return true;

        } catch (err) {
            await connection.rollback();
            console.error('Erro ao atualizar status:', err);
            throw err;
        } finally {
            connection.release();
        }
    }

    async consultarPedido(idPedido) {
        const connection = await pool.getConnection();
        try {
            const [pedido] = await connection.execute(
                `SELECT * FROM tb_pedido WHERE ID_PEDIDO_PK = ?`,
                [idPedido]
            );

            if (pedido.length === 0) {
                throw new Error('Pedido não encontrado');
            }

            const [historico] = await connection.execute(
                `SELECT * FROM tb_hist_pedido 
                 WHERE ID_PEDIDO_FK = ? 
                 ORDER BY DATA DESC`,
                [idPedido]
            );

            return {
                ...pedido[0],
                historico
            };

        } catch (err) {
            console.error('Erro ao consultar pedido:', err);
            throw err;
        } finally {
            connection.release();
        }
    }

    async atualizarPedido(idPedido, novosDados) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const campos = [];
            const valores = [];

            for (const [campo, valor] of Object.entries(novosDados)) {
                if (campo !== 'status' && campo !== 'ID_PEDIDO_PK') {
                    campos.push(`${campo} = ?`);
                    valores.push(valor);
                }
            }

            if (campos.length > 0) {
                const query = `UPDATE tb_pedido SET ${campos.join(', ')} WHERE ID_PEDIDO_PK = ?`;
                valores.push(idPedido);

                await connection.execute(query, valores);
            }

            if (novosDados.status) {
                await connection.execute(
                    `INSERT INTO tb_hist_pedido (ID_PEDIDO_FK, DATA, STATUS) 
                     VALUES (?, ?, ?)`,
                    [idPedido, new Date().toISOString().split('T')[0], novosDados.status]
                );
            }

            await connection.commit();
            console.log(`Pedido ${idPedido} atualizado com sucesso`);
            return true;

        } catch (err) {
            await connection.rollback();
            console.error('Erro ao atualizar pedido:', err);
            throw err;
        } finally {
            connection.release();
        }
    }

    async deletarPedido(idPedido) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            await connection.execute(
                `DELETE FROM tb_hist_pedido WHERE ID_PEDIDO_FK = ?`,
                [idPedido]
            );

            const [result] = await connection.execute(
                `DELETE FROM tb_pedido WHERE ID_PEDIDO_PK = ?`,
                [idPedido]
            );

            if (result.affectedRows === 0) {
                throw new Error('Pedido não encontrado');
            }

            await connection.commit();
            console.log(`Pedido ${idPedido} deletado com sucesso`);
            return true;

        } catch (err) {
            await connection.rollback();
            console.error('Erro ao deletar pedido:', err);
            throw err;
        } finally {
            connection.release();
        }
    }
}

module.exports = Pedido;