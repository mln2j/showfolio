import RegisterForm from '../components/RegisterForm';
import LoginForm from '../components/LoginForm';

export default function HomePage() {
    return (
        <main>
            <h1>Dobrodošao u Showfolio!</h1>
            <RegisterForm />
            <LoginForm />
        </main>
    );
}
