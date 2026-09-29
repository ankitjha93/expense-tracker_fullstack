import styled from "styled-components";

export const MainLayout = styled.div`
    padding: 1.5rem;
    height: 100vh;
    height: 100dvh;
    display: flex;
    gap: 1.5rem;
    max-width: 1920px;
    margin: 0 auto;
    overflow: hidden;

    @media (max-width: 1024px) {
        flex-direction: column;
        padding: 0.85rem;
        gap: 0.85rem;
    }

    @media (max-width: 640px) {
        padding: 0.5rem;
        gap: 0.5rem;
    }
`;

export const InnerLayout = styled.div`
    padding: 2rem 2.2rem;
    width: 100%;
    height: 100%;

    @media (max-width: 1024px) {
        padding: 1.4rem 1.2rem;
    }

    @media (max-width: 640px) {
        padding: 1rem 0.75rem;
    }
`;