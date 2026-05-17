import React from 'react';
import StoreChatScreen from '../storeDashboard/StoreChatScreen';
import {
  fetchClinicConversations,
  fetchClinicMessages,
  fetchClinicPartnerInfo,
  sendClinicChatMessageRest,
  searchClinicsForChat,
  uploadChatMedia
} from '../../services/clinicChatApi';

export default function ClinicChatScreen({ role = 'clinic', tokenKey = 'clinicToken', userKey = 'clinic' }) {
  return (
    <StoreChatScreen
      role={role}
      tokenKey={tokenKey}
      userKey={userKey}
      fetchConversations={fetchClinicConversations}
      fetchMessages={fetchClinicMessages}
      fetchPartnerInfo={fetchClinicPartnerInfo}
      sendMessageRest={sendClinicChatMessageRest}
      searchPartners={searchClinicsForChat}
      uploadMedia={uploadChatMedia}
      searchResultsResponseKey="clinics"
      socketEventPrefix="clinic-chat"
      patientSearchLabel="Search a clinic to start chatting"
      patientSearchPlaceholder="Search clinics..."
      patientNoResultsLabel="No clinics found"
      patientEmptyConversationsLabel="Search a clinic above to start chatting"
      patientWelcomeLabel="Search a clinic in the left panel to start chatting"
    />
  );
}
