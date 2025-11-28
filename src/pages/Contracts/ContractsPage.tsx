"use client";

import React, { useEffect, useState } from "react";
import "./ContractsPage.css";
import type { Contract } from "../../types/contracts";
import List from "./List/List";
import ContractModal from "../../components/ui/ContractModal/ContractModal";
import { contractService } from "../../services/contractService";
import { useAuth } from "../../hooks/useAuth";

export const ContractsPage: React.FC = () => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);

  useEffect(() => {
    if (!user || !user.companyId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = contractService.observeContracts(user.companyId, (contracts) => {
      setContracts(contracts);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, [user?.companyId]);

  const handleContractSaved = (newContract: Contract) => {
    console.log("Contrato salvo:", newContract);
    setIsModalOpen(false);
    setEditingContract(null);
  };

  const handleEditContract = (contract: Contract) => {
    setEditingContract(contract);
    setIsModalOpen(true);
  };

  const handleNewContract = () => {
    setEditingContract(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingContract(null);
  };

  const handleContractDeleted = async (contractId: string) => {
    try {
      await contractService.deleteContract(contractId, user?.role);
    } catch (error) {
      console.error("Erro ao deletar contrato:", error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="contracts-page">
        <div className="contracts-page__main">
          <main className="contracts-page__content">
            <div className="contracts-page__container">
              <div className="contracts-page__loading">
                <p>Carregando contratos...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="contracts-page">
        <div className="contracts-page__main">
          <main className="contracts-page__content">
            <div className="contracts-page__container">
              <div className="contracts-page__error">
                <p>Erro: {error}</p>
                <button onClick={() => window.location.reload()}>
                  Tentar novamente
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="contracts-page">
      <div className="contracts-page__main">
        <main className="contracts-page__content">
          <div className="contracts-page__container">
            <List
              contracts={contracts}
              onContractDeleted={handleContractDeleted}
              onContractEdit={handleEditContract}
              onNewContract={handleNewContract}
            />
          </div>
        </main>
      </div>

      <ContractModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onContractSaved={handleContractSaved}
        contract={editingContract}
      />
    </div>
  );
};
