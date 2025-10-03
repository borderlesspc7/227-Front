// Script para limpar dados de teste do Firebase
// Execute este código no console do navegador quando estiver na página de itens

// Função para limpar dados de teste
async function clearTestData() {
    try {
        console.log("Iniciando limpeza de dados de teste...");

        // Importar as dependências necessárias
        const { collection, getDocs, deleteDoc, doc, query, orderBy } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        // Configuração do Firebase (substitua pelos seus valores)
        const firebaseConfig = {
            apiKey: "sua-api-key",
            authDomain: "seu-auth-domain",
            projectId: "seu-project-id",
            storageBucket: "seu-storage-bucket",
            messagingSenderId: "seu-messaging-sender-id",
            appId: "seu-app-id"
        };

        // Inicializar Firebase (se ainda não estiver inicializado)
        if (!window.firebaseApp) {
            const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
            window.firebaseApp = initializeApp(firebaseConfig);
        }

        const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = getFirestore(window.firebaseApp);

        // Buscar todos os itens
        const q = query(collection(db, "items"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        console.log(`Encontrados ${querySnapshot.docs.length} itens no total`);

        // Filtrar itens que parecem ser de teste
        const testItems = querySnapshot.docs.filter(doc => {
            const data = doc.data();
            const descricao = data.descricao?.toLowerCase() || '';
            return descricao.includes('teste') ||
                descricao.includes('testeaasd') ||
                descricao.includes('mock') ||
                descricao.includes('demo') ||
                descricao.includes('exemplo') ||
                descricao.includes('fake');
        });

        console.log(`Encontrados ${testItems.length} itens de teste para remover`);

        if (testItems.length === 0) {
            console.log("Nenhum item de teste encontrado!");
            return;
        }

        // Confirmar antes de deletar
        const confirmDelete = confirm(`Deseja remover ${testItems.length} itens de teste?\n\nItens que serão removidos:\n${testItems.map(doc => `- ${doc.data().descricao}`).join('\n')}`);

        if (!confirmDelete) {
            console.log("Operação cancelada pelo usuário");
            return;
        }

        // Deletar cada item de teste
        let deletedCount = 0;
        for (const itemDoc of testItems) {
            try {
                await deleteDoc(doc(db, "items", itemDoc.id));
                console.log(`✅ Item removido: ${itemDoc.data().descricao}`);
                deletedCount++;
            } catch (error) {
                console.error(`❌ Erro ao remover item ${itemDoc.id}:`, error);
            }
        }

        console.log(`🎉 Limpeza concluída! ${deletedCount} itens removidos com sucesso`);

        // Recarregar a página para ver as mudanças
        setTimeout(() => {
            window.location.reload();
        }, 1000);

    } catch (error) {
        console.error("❌ Erro durante a limpeza:", error);
    }
}

// Executar a limpeza
clearTestData();
