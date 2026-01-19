import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  DetailsPageContainer,
  PageHeader,
  TabsContainer,
  InformationsDetail,
} from "@/shared/components/layout/DetailsPageLayout";
import OverviewTab from "../components/tabs/OverviewTab";
import StaffTab from "../components/tabs/StaffTab";
import CompaniesTab from "../components/tabs/CompaniesTab";
import { eventsService } from "../api/events.service";
import { companiesService } from "@/features/companies/api/companies.service";
import { staffsService } from "@/features/staffs/api/staffs.service";
import type { Event, CompanyWithEventData, Staff } from "../types";
import { formatDate } from "@/shared/lib/dateUtils";
import { useRecentlyVisited } from "@/shared/hooks/useRecentlyVisited";
import { Modal } from "@/shared/components/ui/Modal";
import { EventForm } from "../components/EventForm";

const EventDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addRecentVisit } = useRecentlyVisited();
  const [staffSearch, setStaffSearch] = useState("");
  const [staffFilter, setStaffFilter] = useState("all");
  const [companySearch, setCompanySearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [event, setEvent] = useState<Event | null>(null);
  const [companies, setCompanies] = useState<CompanyWithEventData[]>([]);
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch event details, companies, and staffs
  useEffect(() => {
    const fetchEventData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch event details
        const eventResponse = await eventsService.getById(Number(id));
        setEvent(eventResponse.data);

        // Track visit to recently visited
        addRecentVisit({
          id: Date.now(),
          type: "event",
          title: eventResponse.data.name,
          description: `${formatDate(
            eventResponse.data.date_begin,
          )} - ${formatDate(eventResponse.data.date_end)}`,
          url: `/events/${id}`,
          entityId: eventResponse.data.id,
        });

        // Fetch companies for this event
        const companiesResponse = await companiesService.getByEvent(Number(id));
        setCompanies(companiesResponse.data);

        // Fetch staffs for this event
        const staffsResponse = await staffsService.getByEvent(Number(id));
        setStaffs(staffsResponse.data);
      } catch (err) {
        setError("Erro ao carregar evento");
        console.error("Error fetching event data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [id]);

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = async () => {
    setIsEditModalOpen(false);
    // Refetch event data
    if (!id) return;
    try {
      const eventResponse = await eventsService.getById(Number(id));
      setEvent(eventResponse.data);
    } catch (err) {
      console.error("Error refetching event:", err);
    }
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
  };

  const handleCompanyAdded = async () => {
    // Refetch companies after adding a new one
    if (!id) return;
    try {
      const companiesResponse = await companiesService.getByEvent(Number(id));
      setCompanies(companiesResponse.data);
    } catch (err) {
      console.error("Error refetching companies:", err);
    }
  };

  const handleStaffAdded = async () => {
    // Refetch staffs after adding new ones
    if (!id) return;
    try {
      const staffsResponse = await staffsService.getByEvent(Number(id));
      setStaffs(staffsResponse.data);
    } catch (err) {
      console.error("Error refetching staffs:", err);
    }
  };

  // Example data - to be calculated from EventStaff/EventCompany APIs
  const totalStaff = 42;
  const companiesStaff = [
    { name: "Acme Productions", role: "production", staffCount: 15 },
    { name: "Tech Solutions", role: "service", staffCount: 12 },
    { name: "Event Masters", role: "service", staffCount: 8 },
    { name: "Creative Studios", role: "production", staffCount: 5 },
    { name: "Global Services", role: "service", staffCount: 2 },
  ];

  if (loading) {
    return (
      <DetailsPageContainer>
        <div className="flex items-center justify-center h-64">
          <p className="text-subtitle">Carregando...</p>
        </div>
      </DetailsPageContainer>
    );
  }

  if (error || !event) {
    return (
      <DetailsPageContainer>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-700">{error || "Evento não encontrado"}</p>
        </div>
      </DetailsPageContainer>
    );
  }

  return (
    <DetailsPageContainer>
      <PageHeader
        title={event.name}
        subtitle={`Evento${event.type === "project" ? " de Projeto" : ""}`}
        onEdit={handleEdit}
      />

      <InformationsDetail>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-text-subtitle">
              Status
            </label>
            <p className="mt-1 text-text-title">
              {event.status === "open" ? "Aberto" : "Fechado"}
            </p>
          </div>
          {event.project_id && (
            <div>
              <label className="text-sm font-medium text-text-subtitle">
                Projeto ID
              </label>
              <p className="mt-1 text-text-title">{event.project_id}</p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-text-subtitle">
              Data de Início
            </label>
            <p className="mt-1 text-text-title">
              {formatDate(event.date_begin)}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-text-subtitle">
              Data de Término
            </label>
            <p className="mt-1 text-text-title">{formatDate(event.date_end)}</p>
          </div>
          {event.location && (
            <div>
              <label className="text-sm font-medium text-text-subtitle">
                Local
              </label>
              <p className="mt-1 text-text-title">{event.location}</p>
            </div>
          )}
          {event.staffs_qnt !== undefined && (
            <div>
              <label className="text-sm font-medium text-text-subtitle">
                Quantidade de Staffs
              </label>
              <p className="mt-1 text-text-title">{event.staffs_qnt}</p>
            </div>
          )}
        </div>
      </InformationsDetail>

      <TabsContainer
        tabs={[
          {
            title: "Visão Geral",
            content: (
              <OverviewTab
                totalStaff={totalStaff}
                companiesStaff={companiesStaff}
              />
            ),
          },
          {
            title: "Staffs",
            content: (
              <StaffTab
                eventId={Number(id)}
                staffSearch={staffSearch}
                setStaffSearch={setStaffSearch}
                staffFilter={staffFilter}
                setStaffFilter={setStaffFilter}
                mockStaff={staffs}
                companies={companies}
                onStaffAdded={handleStaffAdded}
              />
            ),
          },
          {
            title: "Empresas",
            content: (
              <CompaniesTab
                eventId={Number(id)}
                companySearch={companySearch}
                setCompanySearch={setCompanySearch}
                companyFilter={companyFilter}
                setCompanyFilter={setCompanyFilter}
                companies={companies}
                onCompanyAdded={handleCompanyAdded}
              />
            ),
          },
        ]}
        defaultTab="Visão Geral"
      />

      {/* Edit Event Modal */}
      <Modal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        title="Editar Evento"
      >
        <EventForm
          mode="edit"
          event={event || undefined}
          onSuccess={handleEditSuccess}
          onCancel={handleEditCancel}
        />
      </Modal>
    </DetailsPageContainer>
  );
};

export default EventDetailsPage;
