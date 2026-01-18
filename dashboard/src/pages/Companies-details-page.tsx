import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  DetailsPageContainer,
  PageHeader,
  TabsContainer,
  InformationsDetail,
} from "../components/layout/DetailsPageLayout";
import EventsTab from "../components/tabs/EventsTab";
import Badge from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { companiesService, eventsService } from "../api/services";
import type { Company, Event } from "../types";
import { useRecentlyVisited } from "../hooks/useRecentlyVisited";
import { CompanyForm } from "../components/forms/CompanyForm";

const CompaniesDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addRecentVisit } = useRecentlyVisited();
  const [eventSearch, setEventSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch company details and their events
  const fetchCompanyData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch company details
      const companyResponse = await companiesService.getById(Number(id));
      setCompany(companyResponse.data);

      // Track visit to recently visited
      addRecentVisit({
        id: Date.now(),
        type: "company",
        title: companyResponse.data.name,
        description: `CNPJ: ${companyResponse.data.cnpj}`,
        url: `/companies/${id}`,
        entityId: companyResponse.data.id,
      });

      // Fetch events for this company
      const eventsResponse = await eventsService.getByCompany(Number(id));
      setEvents(eventsResponse.data);
    } catch (err) {
      setError("Erro ao carregar empresa");
      console.error("Error fetching company data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, [id]);

  const handleFormSuccess = () => {
    setEditModalOpen(false);
    fetchCompanyData();
  };

  const handleFormCancel = () => {
    setEditModalOpen(false);
  };

  const handleEdit = () => {
    setEditModalOpen(true);
  };

  if (loading) {
    return (
      <DetailsPageContainer>
        <div className="flex items-center justify-center h-64">
          <p className="text-subtitle">Carregando...</p>
        </div>
      </DetailsPageContainer>
    );
  }

  if (error || !company) {
    return (
      <DetailsPageContainer>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-700">{error || "Empresa não encontrada"}</p>
        </div>
      </DetailsPageContainer>
    );
  }

  return (
    <DetailsPageContainer>
      <PageHeader title={company.name} subtitle="Empresa" onEdit={handleEdit} />

      <Modal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        title="Editar Empresa"
        description="Atualize os dados da empresa abaixo."
      >
        <CompanyForm
          mode="edit"
          company={company}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </Modal>

      <InformationsDetail>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-text-subtitle">
              CNPJ
            </label>
            <p className="mt-1 text-text-title">{company.cnpj}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-text-subtitle">
              Tipo
            </label>
            <div className="mt-1">
              <Badge variant="company" />
            </div>
          </div>
        </div>
      </InformationsDetail>

      <TabsContainer
        tabs={[
          {
            title: "Eventos",
            content: (
              <EventsTab
                eventSearch={eventSearch}
                setEventSearch={setEventSearch}
                eventFilter={eventFilter}
                setEventFilter={setEventFilter}
                events={events}
              />
            ),
          },
        ]}
        defaultTab="Eventos"
      />
    </DetailsPageContainer>
  );
};

export default CompaniesDetailsPage;
