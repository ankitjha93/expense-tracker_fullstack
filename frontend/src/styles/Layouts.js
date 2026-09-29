import styled from "styled-components";

export const MainLayout = styled.div`
    padding: 1.5rem;
    height: 100vh;
    display: flex;
    gap: 1.5rem;
    max-width: 1920px;
    margin: 0 auto;

    @media (max-width: 1024px) {
        flex-direction: column;
        padding: 1rem;
        gap: 1rem;
    }
`;

export const InnerLayout = styled.div`
    padding: 2rem 2.5rem;
    width: 100%;
    height: 100%;

    @media (max-width: 768px) {
        padding: 1.25rem;
    }
`;